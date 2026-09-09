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
   el contexto con `createDiscountContext(items, couponCode, coupon)`. El motor nunca ve un `productId` ni resuelve
   cupones; recibe el código ya normalizado (o `null`) junto al cupón resuelto (o `null`) únicamente para informar
   `isCouponValid` a la capa superior.

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

Los pasos 1 y 2 son idénticos en ambos casos de uso y viven en el servicio de aplicación `CartResolver`
(`application/services`): consolida los ítems repetidos, resuelve los productos por el puerto, lanza
`ProductNotFoundError` con todos los identificadores faltantes y resuelve el cupón sin decidir política. La política
(tolerar en cotización, rechazar en checkout) queda en cada caso de uso (HU-04, §12).

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

Sin decisiones abiertas. La 8.1 se cerró en HU-03; se conserva el análisis como registro.

### 8.1 El tope del 35% no es alcanzable con las reglas del enunciado (cerrada en HU-03)

Con las tres reglas aplicadas en cascada sobre un carrito compuesto íntegramente por productos de Tecnología, con
volumen superior a 100 y cupón válido, el factor total es `0.90 × 0.95 × 0.85 = 0.72675`, es decir un descuento
máximo de **27.325%**. Ninguna combinación de productos reales del catálogo puede superar el 35%; la cuarta regla
nunca se activaría en la demo y la alerta del 35% (HU-05) no podría mostrarse en vivo.

Opciones consideradas:

| Opción | Pros | Contras |
|---|---|---|
| A. Probar el tope solo en pruebas unitarias con contextos sintéticos | Fiel al enunciado; cero código extra | La alerta del 35% (HU-05) no se ve en la demo |
| B. Repositorio de cupones con más de un cupón activo, uno de ellos con porcentaje suficiente para superar el tope (ej. un cupón de demostración al 30%) | El modelo de cupón ya es extensible (código, porcentaje, estado); la demo muestra el tope real; `WELCOME2026` sigue siendo el cupón del enunciado | Introduce un cupón no mencionado en el enunciado; debe documentarse como dato de demostración |
| C. Interpretar el descuento de categoría como configurable por categoría con porcentajes distintos | Extensible | Inventa reglas de negocio que el enunciado no pide |

**Recomendación: B**, dejando explícito en `docs/ia.md` y en la sustentación que se detectó la inconsistencia y que el
cupón adicional existe solo para hacer observable la regla 4.

**Decisión (HU-03, 2026-09-09): opción B, confirmada por el desarrollador.** La semilla de cupones incluye `DEMO30`
(30%, activo) junto a `WELCOME2026` (15%, el del enunciado) y `SUMMER2025` (20%, inactivo, para pruebas). Para activar
el tope hace falta un cupón mayor al 23.98% (`0.855 × (1 − r) < 0.65`); se eligió 30% en lugar de 25% porque el
truncado es visible a simple vista: con la `Laptop Pro 14` (1299.99) la cascada da 40.15% (total 778.04), el tope
lo recorta al 35% (total 844.99) y `capAdjustment` queda en 66.95. Con 25% el ajuste sería de centavos. El tope sigue
requiriendo productos de Tecnología en el carrito: volumen más `DEMO30` sin categoría dan `0.95 × 0.70 = 0.665`, un
33.5%. Ninguna regla del enunciado se modifica; `WELCOME2026` conserva su caso real del 27.325%, fijado por prueba a
dos decimales (total 944.77).

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
| `ICoupon` fuera de `shared`, en `apps/backend/src/domain/entities` (HU-03) | Declararlo en `shared` como listaba el diseño inicial | El cliente nunca recibe cupones (criterio de seguridad). Un contrato compartido invitaría a importarlo desde el frontend. Mismo criterio que `IHealthStatus` en §9. |
| `IApiErrorDetail.details?: IStockConflict[]` definido desde ahora | Ampliar `IApiError` en HU-04 (checkout) | El `409` de checkout debe listar todos los conflictos y la estructura de error es parte de esta historia; definirlo ahora evita romper el contrato dos historias después. `details` es opcional y solo viaja en ese caso. |
| Enums de tipo string (`TECHNOLOGY = 'TECHNOLOGY'`) con las cuatro categorías cerradas | Enums numéricos | El valor viaja tal cual en el JSON: legible en la demo y en las pruebas, sin exponer índices internos. |
| `FLOAT_TOLERANCE` junto a las demás constantes de descuento | Definirla en HU-03 dentro de la estrategia del tope | Es una constante de precisión del dominio, de la misma familia; centralizarla evita tocar el archivo de constantes en HU-03. `roundMoney` y `MAX_DISCOUNT_ALERT_MESSAGE` sí se posponen a HU-03 y HU-05, sus primeros consumidores. |
| Pruebas unitarias sobre constantes y enumerables (valores del enunciado, orden de precedencia y factor máximo en cascada 0.72675) | Sin pruebas por ser "solo datos" | Fijan por prueba las cifras del enunciado y documentan el hallazgo 3.4.1 de `ia.md`. Con cobertura v8 los enums cuentan como funciones; el umbral del 80% aplica también a este paquete. |

## 11. Decisiones de implementación del catálogo y el motor de descuentos (HU-03)

Decisiones tomadas al construir los repositorios en memoria, `GET /products` y el motor. Todas fueron propuestas por la IA
en el plan de la historia y aprobadas por el desarrollador antes de codificar.

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| Puertos asíncronos (`Promise`) con implementación en memoria síncrona | Puertos síncronos | Un adaptador real (base de datos) encaja sin cambiar la firma de los casos de uso. Como el cuerpo de `decrementStock` no cede el control, validar y actualizar ocurre en un solo paso: no hay ventana para una condición de carrera entre peticiones concurrentes. |
| `decrementStock` retorna `Promise<boolean>` y no muta cuando rechaza | Lanzar una excepción desde el repositorio | `BaseError` e `InsufficientStockError` son alcance de HU-04 y el estándar prohíbe lanzar `Error` genérico hacia capas superiores. HU-04 valida antes con `StockValidator`; el booleano es una salvaguarda, no el flujo principal. También rechaza cantidades no enteras o menores a 1. |
| UUID v4 fijos en `products.seed.ts` | `crypto.randomUUID()` al arrancar | La demo y las pruebas e2e necesitan identificadores estables entre reinicios. `randomUUID()` queda para las órdenes (HU-04). |
| `IDiscountContext` con `currentTotal` y una lista `appliedDiscounts: IAppliedDiscount[]` (`type: DiscountTypeEnum`, `amount`) | Un campo por descuento (`categoryDiscount`, `volumeDiscount`, …) en el contexto | Cada estrategia registra su resultado, incluso cero, sin conocer los campos del desglose; el motor arma el `IDiscountBreakdown` leyendo el monto por tipo. Le da uso al `DiscountTypeEnum` de HU-02 y deja una traza ordenada de la cascada. Para el tope, `amount` es el ajuste que se devuelve al total (`registerCapAdjustment`). |
| Utilidades puras `createDiscountContext`, `registerDiscount`, `registerCapAdjustment`, `findDiscountAmount` y `sumItemsSubtotal` en `domain/discounts/discount-context.util.ts` | Repetir el spread del contexto en cada estrategia | Evita cuatro bloques duplicados de cinco líneas; las estrategias quedan en una o dos líneas de regla. Los casos de uso de HU-04 reutilizan `createDiscountContext`. |
| `isCouponValid = couponCode === null || coupon !== null`; `CouponDiscountStrategy` además exige `coupon.isActive` | Que el motor solo reciba el cupón resuelto | Sin el código el motor no distingue "no envió cupón" (válido) de "envió uno que no resolvió" (inválido). La comprobación de `isActive` es defensiva: el repositorio ya filtra inactivos, pero la estrategia se prueba aislada con cupones inactivos. |
| `isMaxDiscountReached` es `true` solo cuando hubo truncado (ajuste mayor que `FLOAT_TOLERANCE`) | Marcarlo también en un 35% exacto | El enunciado dice que un 35% exacto "no se altera"; la alerta del frontend se enciende solo cuando el tope recortó algo. Con datos reales un 35% exacto es prácticamente imposible. |
| `effectiveDiscountRate` se calcula sobre `totalDiscount` y `originalSubtotal` ya redondeados, con `roundRate` (4 decimales); con tope alcanzado se asigna `MAX_DISCOUNT_RATE` | Calcularla sobre los valores sin redondear | Es coherente con los montos que el cliente ve: 355.22 de 1299.99 es 27.32%. El 27.325% exacto de la cascada cae justo en el límite de redondeo de la cuarta cifra y produciría un valor frágil ante el ruido de coma flotante. |
| `roundRate` junto a `roundMoney` en `money.util.ts` | Reutilizar `roundMoney` para la tasa | Una tasa a dos decimales perdería el 0.2732 y mostraría 0.27; las tasas viajan como fracción y necesitan cuatro cifras. |
| `DiscountEngine` recibe `IDiscountStrategy[]` por constructor y no se registra en Nest en esta historia | Registrarlo como provider con `useFactory` | Ningún caso de uso de HU-03 lo consume; registrarlo sería adelantar HU-04. El constructor permite probar el motor con estrategias mockeadas (orden y encadenamiento). |
| Repositorios como providers de `AppModule` con tokens `Symbol` (`PRODUCT_REPOSITORY`, `COUPON_REPOSITORY`) y sin parámetros de constructor | Constructor con la semilla como parámetro opcional | Nest intenta resolver todo parámetro del constructor de un `@Injectable`; un parámetro opcional con valor por defecto rompe el arranque. El estado se inicializa como propiedad a partir de la semilla; los singletons de Nest garantizan que el stock persista entre peticiones y vuelva a la semilla al reiniciar. |
| `findActiveByCode` compara el código exacto | Normalizar (`trim` + mayúsculas) dentro del repositorio | La normalización es una regla del borde HTTP (decisión cerrada en `CLAUDE.md` §8) y la aplica el DTO de HU-04; duplicarla en el repositorio la haría inconsistente si cambia. |
| `findByIds` omite los inexistentes y no repite ids | Lanzar error desde el repositorio ante un id inexistente | El puerto solo resuelve datos; decidir que un id inexistente es un `404` es responsabilidad del caso de uso (HU-04), que compara lo pedido con lo resuelto. |
| Mocks del dominio en `domain/discounts/mocks/` y del puerto en `application/use-cases/mocks/` con los datos de la semilla | Datos inventados por prueba | Los montos de las pruebas (`Laptop Pro 14` a 1299.99, `WELCOME2026`, `DEMO30`) coinciden con los de la demo, así la sustentación puede reproducir cada `it` en vivo. |

## 12. Decisiones de implementación de cotización, checkout y órdenes (HU-04)

Decisiones tomadas al construir los DTOs, el filtro global, los casos de uso y el repositorio de órdenes. Todas fueron
propuestas por la IA en el plan de la historia; el desarrollador las aprobó y ajustó dos (cuerpo excesivo y orden del
listado) antes de codificar.

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| `ValidationPipe` y `ApiExceptionFilter` registrados como providers `APP_PIPE` y `APP_FILTER` en `AppModule` | `app.useGlobalPipes()` / `app.useGlobalFilters()` en `main.ts` | Las pruebas e2e construyen la aplicación desde `AppModule` sin pasar por `main.ts`; con la configuración en el módulo, desarrollo, e2e y demo se comportan igual. El límite de cuerpo sí queda en `main.ts` (es una opción del parser de Express, no un provider) a través de `applyBodySizeLimit`, que el e2e reutiliza. |
| Cuerpo mayor a 100 KB → `400` con `CEC_CHECKOUT_1002` | Conservar el `413 Payload Too Large` que emite body-parser | Decisión del desarrollador para respetar la HU: el frontend trata todo `400` como error de negocio con mensaje propio y un `413` obligaría a un caso especial. El filtro reconoce el error del parser (no es una `HttpException`) por su `status` 413 y lo remapea; ver `ia.md` §3.3.2. |
| `couponCode` vacío o con solo espacios se transforma a `undefined` (sin cupón) | Responder `400` | Decisión del desarrollador: el input del frontend vacío equivale a "sin cupón" y la cotización responde `isCouponValid: true`; no relaja ninguna validación de seguridad. Si se quiere avisar al usuario, es una tarea secundaria del frontend. |
| `OrderNotFoundError` como cuarto error de dominio (`CEC_ORDERS_3001` → 404) | Que `GetOrderByIdUseCase` devuelva `null` y el controlador lance `NotFoundException` | La HU listaba tres errores, pero el `404` de órdenes necesita uno; decidirlo en el controlador sería lógica fuera del caso de uso. |
| Códigos concretos: `CHECKOUT_INVALID_PAYLOAD` (1001), `CHECKOUT_PAYLOAD_TOO_LARGE` (1002), `ORDERS_INVALID_ID` (1001), `CHECKOUT_UNEXPECTED_ERROR` (2001), `PRODUCTS_NOT_FOUND`, `DISCOUNTS_INVALID_COUPON`, `CHECKOUT_INSUFFICIENT_STOCK`, `ORDERS_NOT_FOUND` (3001) | Derivar el módulo del código a partir de la ruta en el filtro | Cada código es un miembro explícito del enum. Las dos fuentes de `400` de Nest (`ValidationPipe` y `ParseUUIDPipe`) usan fábricas de `infrastructure/http` que adjuntan `{ code, message }` a la `BadRequestException`; el filtro solo los lee. Los mensajes de `class-validator` se declaran en español en cada decorador y la fábrica traduce `whitelistValidation` a "El campo X no está permitido". |
| Servicio de aplicación `CartResolver` (`resolveItems`, `resolveCoupon`) compartido por cotización y checkout | Duplicar consolidación y resolución en ambos casos de uso, o que checkout componga a `QuoteCartUseCase` | Evita un bloque duplicado de más de cinco líneas; la política del cupón (tolerar vs. rechazar) queda en cada caso de uso. Carpeta `application/services/` agregada al árbol de `CLAUDE.md` §4. |
| `DiscountEngine` y `StockValidator` registrados con `useFactory` en `AppModule`, sin decoradores | Decorarlos con `@Injectable()` | Mantiene la regla §5 (dominio sin `@nestjs/*`). Los casos de uso los inyectan por clase, así se prueban con el motor y el validador mockeados como exige la HU. |
| `InMemoryOrderRepository.findAll` devuelve el arreglo en orden inverso de inserción | Ordenar por `createdAt` descendente | Decisión del desarrollador: `createdAt` tiene precisión de segundos y dos órdenes del mismo segundo no serían ordenables; el orden de llegada del arreglo es determinista y basta para el listado. |
| El decremento se hace ítem a ítem con `decrementStock`; un `false` se traduce a `InsufficientStockError` | Añadir un `decrementStockBatch` atómico al puerto | Tras `StockValidator` en el mismo ciclo, el `false` es inalcanzable: los `await` sobre promesas ya resueltas se encolan como microtareas y se drenan antes de atender otra petición, así que no hay intercalado entre validar y decrementar con los repositorios en memoria. La guarda existe como salvaguarda y se prueba. |
| Log `INFO` de "orden creada" (id y total) en `CheckoutController`; `WARN`/`ERROR` con `error.message` en el filtro | Logger en los casos de uso | `CLAUDE.md` §5 limita `@nestjs/common` en `application` a `@Injectable`/`@Inject`. Ningún log incluye el payload del cliente ni el objeto de error. |
| `@IsUUID('4')` en `CartItemDto` y `ParseUUIDPipe({ version: '4' })` en órdenes | Aceptar cualquier versión de UUID | Todos los identificadores del sistema (semilla y `randomUUID()`) son v4; la restricción es coherente con la documentación y no excluye ningún caso real. |
| `createdAt` con `dayjs().unix()` | `Math.floor(Date.now() / 1000)` | El estándar del equipo fija `dayjs` como librería de fechas y el transporte como unix UTC en segundos; `unix()` ya devuelve segundos sin zona horaria. Es el único uso de `dayjs` en el backend. |
