# Arquitectura — Core E-Commerce Checkout

> **Versión inicial (HU-00): diseño objetivo.** Este documento se redacta antes de implementar para servir de contrato
> de diseño. Cada historia que modifique una decisión debe actualizarlo en el mismo commit. Al cierre del proyecto se
> revisa para que refleje lo efectivamente construido.

## 1. Problema

Módulo de checkout que gestiona un carrito, aplica un motor de descuentos acumulativos en cascada con orden de
precedencia y tope absoluto del 35%, valida stock, persiste órdenes y expone el desglose al usuario en tiempo real.
La dificultad no está en la cantidad de código sino en que el cálculo sea **consistente, aislado y verificable**.

## 2. Stack y justificación

| Decisión | Justificación |
|---|---|
| **TypeScript de extremo a extremo** | Permite un paquete de contratos compartido (`packages/shared`) que el compilador valida en ambos lados. Un cambio en un contrato rompe la compilación de quien no lo respete; el tipado estricto deja de ser una convención y pasa a ser una garantía. |
| **NestJS** | Inyección de dependencias nativa, que es lo que hace viable invertir dependencias hacia puertos abstractos sin escribir un contenedor propio. Módulos, pipes y filtros globales resuelven validación de entrada y formato de error de forma declarativa. |
| **Angular con signals** | El carrito es estado reactivo derivado (subtotal, unidades, stock restante, alerta) y signals con `computed` lo modelan de forma directa y testeable sin librería de estado adicional. Componentes standalone reducen ceremonia de módulos. |
| **Persistencia en memoria** | El enunciado la admite y elimina infraestructura externa para la demo. El costo es que el estado se pierde al reiniciar; se acepta porque el foco evaluado es el aislamiento del dominio, y los repositorios en memoria implementan puertos que una implementación real reemplazaría sin tocar casos de uso ni dominio. |
| **pnpm 10 workspaces vía Corepack** | Monorepo con enlaces locales entre `apps/*` y `packages/shared` sin publicar paquetes. Instalación única desde la raíz. La versión se fija en `packageManager` para que todo el equipo use la misma; Corepack 0.34 (el que trae Node 22) no ejecuta pnpm 12, por eso se fija la 10. |
| **Jest en ambas apps** | Un solo runner, una sola forma de leer cobertura en consola durante la sustentación. `jest-preset-angular` evita Karma, vitest y el navegador. Cobertura con `coverageProvider: 'v8'`: istanbul atribuye una rama no cubierta a cada método decorado de Nest/Angular, lo que penaliza el umbral del 80% sin reflejar código real. |
| **Angular 21 zoneless** | Angular 22 exige Node ≥ 22.22.3 y el entorno del desarrollador se mantiene en 22.22.0; Angular 21 cumple el mínimo acordado (≥ 20) y trae zoneless por defecto, coherente con un estado basado en signals. Las pruebas usan `setupZonelessTestEnv` y `await fixture.whenStable()`. |
| **Lint y formato compartidos** | `eslint.config.mjs` y `.prettierrc` en la raíz del monorepo; cada app solo agrega su `tsconfigRootDir` y las reglas de su framework. Una única fuente para 2 espacios, comillas simples y punto y coma. |

## 3. Estructura de carpetas

```
apps/backend/src/
├── domain/          Entidades, puertos, motor de descuentos, errores de dominio. Sin NestJS.
├── application/     Casos de uso: orquestan puertos y dominio. Sin reglas matemáticas.
├── infrastructure/  Repositorios en memoria, datos semilla, filtro de excepciones, pipes.
└── presentation/    Controladores, DTOs e interfaces propias del borde HTTP (IHealthStatus).

apps/frontend/src/app/checkout/
├── components/      UI standalone, sin lógica de negocio.
├── services/        HTTP tipado y notificaciones.
├── state/           CartStore (signals): única fuente de estado.
└── interface/       Interfaces exclusivas del frontend.
apps/frontend/src/environments/   environment.ts (apiBaseUrl) tipado con IEnvironment.
apps/frontend/src/testing/mocks/  mock[Entidad] + barrel index.ts.

packages/shared/     @cec/shared: interfaces I*, enumerables *Enum, constantes del dominio. Barrel en src/index.ts.
```

La separación por capa (y no por feature) en el backend se eligió porque el proyecto tiene un solo módulo funcional
(checkout) y lo que se quiere hacer evidente es la **dirección de las dependencias**. En un producto con varios
módulos la organización sería feature-first con estas mismas capas dentro de cada uno.

## 4. Aislamiento del motor de descuentos

El motor vive en `domain/discounts` y cumple tres restricciones:

1. **Sin framework**: ninguna clase del motor lleva decoradores de NestJS ni importa de `infrastructure` o
   `presentation`. Se puede ejecutar y probar con `ts-node` sin levantar la aplicación.
2. **Función pura respecto de sus entradas**: recibe un `IDiscountContext` (ítems ya resueltos con precio y categoría
   desde el catálogo del servidor, cupón ya resuelto desde su repositorio) y devuelve un `IDiscountBreakdown`.
   No consulta repositorios, no lee reloj, no muta nada.
3. **Los datos entran resueltos**: el caso de uso es quien consulta `IProductRepository` e `ICouponRepository` y arma
   el contexto. El motor nunca ve un `productId` ni un `couponCode` crudo.

Consecuencia: la persistencia (repositorios en memoria) y la capa HTTP (controladores, DTOs, filtro de errores) pueden
cambiar por completo sin tocar una línea del motor, y el motor se prueba con objetos planos sin mocks de Nest.

### Flujo de una petición de checkout

```
POST /checkout  { items: [{ productId, quantity }], couponCode? }
   │
   ▼
[presentation]  CheckoutController
   │  ValidationPipe → CheckoutRequestDto (whitelist, forbidNonWhitelisted)
   │  delega en el caso de uso; no accede a repositorios
   ▼
[application]   ProcessCheckoutUseCase
   │  1. IProductRepository.findByIds(ids)          → ProductNotFoundError (404) si falta alguno
   │  2. ICouponRepository.findActiveByCode(code)   → InvalidCouponError (400) si no es válido
   │  3. StockValidator.validate(items, products)   → InsufficientStockError (409) con todos los conflictos
   │  4. DiscountEngine.calculate(context)          → IDiscountBreakdown           ┐ dominio puro
   │  5. IProductRepository.decrementStock(...)      (solo si 1–4 pasaron)          │
   │  6. IOrderRepository.save(order)                                                ┘
   ▼
[domain]        DiscountEngine ──▶ DiscountStrategyFactory.createChain()
                   │   [ CategoryDiscountStrategy ]      10% sobre ítems TECHNOLOGY
                   │   [ VolumeDiscountStrategy   ]      5% si subtotal post-categoría > 100
                   │   [ CouponDiscountStrategy   ]      15% si cupón activo
                   │   [ MaxDiscountCapStrategy   ]      trunca al 35% del subtotal original
                   ▼
                IDiscountBreakdown { originalSubtotal, categoryDiscount, volumeDiscount, couponDiscount,
                                     capAdjustment, totalDiscount, effectiveDiscountRate, finalTotal,
                                     isMaxDiscountReached, isCouponValid }
   ▼
[infrastructure] InMemoryProductRepository / InMemoryOrderRepository / InMemoryCouponRepository
   ▼
201 { id, createdAt, items, couponCode, breakdown, finalTotal }
```

`POST /checkout/quote` recorre los pasos 1, 2 y 4 únicamente (sin validar stock ni mutar); si el cupón es inválido
no lanza error: cotiza sin la regla 3 y responde `isCouponValid: false`.

## 5. Patrones de diseño

### Strategy — reglas de descuento

`IDiscountStrategy` define `apply(context: IDiscountContext): IDiscountContext`. Cada regla del enunciado es una
implementación independiente que recibe el contexto acumulado hasta ese punto y devuelve un contexto nuevo (inmutable)
con su descuento registrado. Ventajas concretas para este problema:

- El **orden de precedencia** queda declarado en un solo lugar (la Factory), no repartido en `if` anidados.
- El **tope del 35%** se modela como una cuarta estrategia (`MaxDiscountCapStrategy`) al final de la cadena. Así es
  imposible que el motor lo omita y se prueba aislado con contextos sintéticos que sí superen el 35%.
- Agregar una regla nueva (ej. descuento por cliente frecuente) es una clase nueva y una línea en la Factory.

### Factory — construcción de la cadena

`DiscountStrategyFactory.createChain()` devuelve el arreglo ordenado de estrategias. `DiscountEngine` solo conoce
`IDiscountStrategy[]` y hace un `reduce` sobre el contexto inicial. El motor no importa ninguna clase concreta;
la Factory es el único punto que conoce el orden y las implementaciones.

### Observer — estado del carrito

`CartStore` (Angular signals) mantiene el estado privado del carrito y expone selectores `computed`:
`items`, `originalSubtotal`, `totalUnits`, `availableStockFor(productId)`, `breakdown`, `isBreakdownStale`,
`isMaxDiscountReached`. Los componentes observan los selectores y reaccionan; ninguno mantiene copia local.
Cualquier mutación del carrito marca el desglose como desactualizado, lo que apaga la alerta del 35% y deshabilita
"Pagar" hasta volver a cotizar, sin que ningún componente tenga que coordinarse con otro.

### Adicionales (no evaluados como patrón, pero presentes)

- **Repository / Ports & Adapters**: puertos en dominio, adaptadores en memoria en infraestructura, inyectados por token.
- **DTO + Pipe**: validación estructural en el borde antes de entrar a la aplicación.

## 6. Trade-offs asumidos

| Trade-off | Elección | Costo aceptado |
|---|---|---|
| Simplicidad vs. extensibilidad | Strategy + Factory aunque hoy hay solo cuatro reglas | Cuatro clases pequeñas en vez de una función de 30 líneas. Se acepta porque el enunciado evalúa explícitamente la modularidad y porque el tope como estrategia hace el orden auditable. |
| Rendimiento vs. claridad | El motor recorre la cadena y crea un contexto nuevo por regla | Asignaciones extra por cálculo; irrelevantes para carritos de decenas de ítems. Se prioriza inmutabilidad y trazabilidad del desglose. |
| Persistencia real vs. velocidad de entrega | Repositorios en memoria detrás de puertos | Sin durabilidad ni concurrencia entre procesos. La sustitución por SQLite/Postgres no toca dominio ni aplicación. |
| Cotización en servidor vs. cálculo local en frontend | Todo cálculo en servidor; el frontend solo muestra el subtotal original localmente | Una llamada HTTP por "Aplicar". Se acepta porque elimina la duplicación de reglas y hace imposible que cliente y servidor discrepen. |
| Precisión monetaria | `number` con redondeo a 2 decimales solo al final y tolerancia en la comparación del tope | No se introduce una librería decimal. Suficiente para el rango de precios de la demo; se documenta como límite conocido. |
| Organización por capa vs. por feature | Por capa | Menos idiomático para productos grandes; más legible para exponer la dirección de dependencias en un único módulo. |

## 7. Principios de seguridad transversales

Toda HU debe cumplirlos; los criterios de seguridad de cada ficha los concretan.

1. **Validación en el borde**: `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted`; límite de tamaño de
   cuerpo y de cantidad de ítems por carrito; `ParseUUIDPipe` en parámetros de ruta.
2. **El cliente nunca es fuente de verdad**: precios, descuentos, totales, stock y validez de cupón se resuelven
   exclusivamente en el servidor. La petición solo transporta identificadores, cantidades y el código de cupón.
3. **Errores opacos**: formato único `{ error: { code, message } }`; sin stack traces ni nombres internos hacia el
   cliente; `500` con mensaje genérico.
4. **Logs sin datos sensibles ni payloads**: se registra `error.message`, id de orden y totales; nunca el objeto de
   error completo ni el cuerpo de la petición.
5. **Cupones no enumerables**: el cliente no recibe la lista de cupones; los mensajes de cupón inválido no distinguen
   entre inexistente e inactivo.
6. **Integridad de stock**: validar-y-decrementar sin ceder control entre ambos pasos; nunca stock negativo; ninguna
   mutación si cualquier validación falla.
7. **CORS restringido** al origen del frontend por variable de entorno; sin comodín.
8. **Frontend**: interpolación de Angular (nunca `innerHTML`), sin datos de orden en almacenamiento persistente del
   navegador, URL del backend solo desde `environment`.

## 8. Decisiones abiertas

### 8.1 El tope del 35% no es alcanzable con las reglas del enunciado

Con las tres reglas aplicadas en cascada sobre un carrito compuesto íntegramente por productos de Tecnología, con
volumen superior a 100 y cupón válido, el factor total es `0.90 × 0.95 × 0.85 = 0.72675`, es decir un descuento
máximo de **27.325%**. Ninguna combinación de productos reales del catálogo puede superar el 35%; la cuarta regla
nunca se activaría en la demo y HU-19 no podría mostrarse en vivo.

Opciones consideradas:

| Opción | Pros | Contras |
|---|---|---|
| A. Probar el tope solo en pruebas unitarias con contextos sintéticos | Fiel al enunciado; cero código extra | La alerta de HU-19 no se ve en la demo |
| B. Repositorio de cupones con más de un cupón activo, uno de ellos con porcentaje suficiente para superar el tope (ej. un cupón de demostración al 30%) | El modelo de cupón ya es extensible (código, porcentaje, estado); la demo muestra el tope real; `WELCOME2026` sigue siendo el cupón del enunciado | Introduce un cupón no mencionado en el enunciado; debe documentarse como dato de demostración |
| C. Interpretar el descuento de categoría como configurable por categoría con porcentajes distintos | Extensible | Inventa reglas de negocio que el enunciado no pide |

**Recomendación: B**, dejando explícito en `docs/ia.md` y en la sustentación que se detectó la inconsistencia y que el
cupón adicional existe solo para hacer observable la regla 4. **Pendiente de confirmación** antes de implementar HU-03
(datos semilla) y HU-08 (cupón).

## 9. Decisiones de implementación de la estructura base (HU-01)

Decisiones tomadas al construir el scaffold que no estaban en el diseño objetivo. Todas fueron propuestas por la IA y
aprobadas por el desarrollador antes de codificar.

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| `HealthController` responde `{ status: 'ok' }` directamente, sin caso de uso | Un `GetHealthUseCase` para respetar al pie de la letra "presentación solo invoca casos de uso" | `/health` no tiene dominio que orquestar; un caso de uso vacío sería ceremonia. Es la única excepción a la regla de capas y queda declarada en `CLAUDE.md` §5. |
| Variables de entorno con `process.loadEnvFile()` nativo de Node 22 | `@nestjs/config` o `dotenv` | Una dependencia menos para dos variables. Si falta `.env` se conservan valores por defecto de desarrollo con un `WARN`; `CORS_ORIGIN='*'` se rechaza y cae al origen por defecto. `enableCors({ origin })` recibe siempre una cadena, nunca un comodín. |
| Scaffold del backend con `@nestjs/cli@11` | Último Nest CLI (genera Nest 12: ESM, TypeScript 6, vitest, oxlint) | El stack acordado es Nest 11 con Jest y ESLint. Nest 12 obligaría a migrar a Jest sobre ESM con decoradores, con un costo alto para la prueba y sin beneficio en los criterios evaluados. |
| Frontend con Angular 21 en lugar de 22 | Actualizar Node de la máquina a ≥ 22.22.3 | Decisión del desarrollador: la versión de Node es de plataforma y no se cambia por un parche. Angular 21 cumple el mínimo (≥ 20). Ver `ia.md` §3.3.1. |
| Interfaz `IHealthStatus` en `presentation/interface/` | Declarar el tipo inline en el controlador o en `packages/shared` | El estándar del equipo exige interfaces en carpeta `interface/` por módulo; el frontend no consume `/health`, así que no pertenece a `shared`. |
| `.gitkeep` en las carpetas de capa vacías (`domain`, `application`, `infrastructure`, `services`, `state`, `interface`) | Crear las carpetas cuando llegue la primera HU que las use | La HU-01 exige la estructura visible desde el primer commit. Se eliminan a medida que cada carpeta recibe archivos reales. |
| Override `multer >= 2.3.0` en `pnpm-workspace.yaml` | Aceptar los avisos (no eran críticos) | `@nestjs/platform-express` arrastraba `multer` 2.2.0 con tres avisos altos de denegación de servicio. El proyecto no usa `multer` directamente; el override deja `pnpm audit` limpio sin tocar código. |
| Cobertura con `coverageProvider: 'v8'` | istanbul (default de Jest) | istanbul marca una rama no cubierta en cada método decorado (`@Get`, `@Component`), lo que hunde el porcentaje de ramas sin reflejar código real; v8 mide sobre el código ejecutado. Se excluyen de cobertura `main.ts`, `*.interface.ts`, `environments/` y `testing/`, que no contienen lógica. |

## 10. Decisiones de implementación de los contratos compartidos (HU-02)

Decisiones tomadas al construir `@cec/shared`. Todas fueron propuestas por la IA y aprobadas por el desarrollador antes
de codificar.

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| El paquete se compila con `tsc` a `dist/` (CommonJS con `.d.ts`) y se consume como dependencia `workspace:*` con `exports` (`types`/`default`) | Consumir las fuentes directamente con `paths` en cada tsconfig o con `main: src/index.ts` | Enums y constantes son código en tiempo de ejecución: Node no ejecuta TypeScript de `node_modules` y `tsc` del backend no emite archivos fuera de su `rootDir`. Las alternativas obligaban a mover `rootDir` a la raíz del monorepo, cambiar `start:prod`, agregar `moduleNameMapper` en ambos Jest o pasar el backend a webpack. Compilar a `dist` funciona sin trucos en `nest build`, `node dist/main`, ambos Jest y `ng build`. |
| `prepare` en `shared` compila el paquete durante `pnpm install`; el script `dev` de la raíz lo recompila antes de levantar las apps | Exigir un `pnpm build` manual tras clonar | Un clon recién instalado queda listo para `pnpm dev`. `pnpm build` ya respeta el orden topológico de pnpm (`shared` primero). |
| Salida CommonJS y `allowedCommonJsDependencies: ['@cec/shared']` en `angular.json` | Emitir ESM | El Jest del backend corre en CommonJS y tendría que transformar el paquete desde `node_modules`. La línea en `angular.json` solo silencia el aviso de optimización de esbuild; el paquete es diminuto y no afecta el bundle. |
| Solo interfaces en `shared`; los DTOs con `class-validator` viven en `presentation/dto` e `implements` la interfaz | Clases DTO decoradas en `shared` | Los decoradores exigen `class-validator` y `reflect-metadata`, rompiendo "TypeScript puro". Con `implements` un cambio en la interfaz rompe la compilación del DTO y del servicio Angular a la vez; las respuestas se tipan directamente con la interfaz sin DTO de salida. |
| Un único `ICheckoutRequest` para `POST /checkout/quote` y `POST /checkout` | `IQuoteRequest` separado | Ambos endpoints reciben exactamente el mismo payload; un alias duplica vocabulario sin aportar tipado. |
| `ICoupon` fuera de `shared`, en `apps/backend/src/domain/entities` (HU-03/HU-08) | Declararlo en `shared` como listaba el diseño inicial | El cliente nunca recibe cupones (criterio de seguridad). Un contrato compartido invitaría a importarlo desde el frontend. Mismo criterio que `IHealthStatus` en §9. |
| `IApiErrorDetail.details?: IStockConflict[]` definido desde ahora | Ampliar `IApiError` en HU-12/HU-13 | El `409` de checkout debe listar todos los conflictos y la estructura de error es parte de esta historia; definirlo ahora evita romper el contrato dos historias después. `details` es opcional y solo viaja en ese caso. |
| Enums de tipo string (`TECHNOLOGY = 'TECHNOLOGY'`) con las cuatro categorías cerradas | Enums numéricos | El valor viaja tal cual en el JSON: legible en la demo y en las pruebas, sin exponer índices internos. |
| `FLOAT_TOLERANCE` junto a las demás constantes de descuento | Definirla en HU-09 dentro de la estrategia del tope | Es una constante de precisión del dominio, de la misma familia; centralizarla evita tocar el archivo de constantes en HU-09. `roundMoney` y `MAX_DISCOUNT_ALERT_MESSAGE` sí se posponen a HU-05 y HU-19, sus primeros consumidores. |
| Pruebas unitarias sobre constantes y enumerables (valores del enunciado, orden de precedencia y factor máximo en cascada 0.72675) | Sin pruebas por ser "solo datos" | Fijan por prueba las cifras del enunciado y documentan el hallazgo 3.4.1 de `ia.md`. Con cobertura v8 los enums cuentan como funciones; el umbral del 80% aplica también a este paquete. |
