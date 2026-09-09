# Gobernanza de IA — Core E-Commerce Checkout

> **Documento vivo.** Se crea como esqueleto en HU-00 y se completa de forma incremental durante cada historia.
> Las entradas de la bitácora se registran en el momento en que ocurren, no al final.

Herramienta principal: Claude Code (Anthropic) en VS Code, con estándares globales del equipo cargados desde
`~/.claude/CLAUDE.md` y el contexto del proyecto desde `CLAUDE.md` en la raíz del repositorio.

## 1. Skills / prompts automatizados

> Descripción detallada de al menos un prompt estructurado o skill creado para automatizar tareas del proyecto.

### 1.1 _Pendiente_

| Campo | Detalle |
|---|---|
| Nombre | |
| Ubicación | |
| Propósito | |
| Entrada | |
| Salida | |
| Reglas que impone | |
| HU donde se usó | |

## 2. Agentes / sub-agentes

> Explicación de al menos un agente con rol y reglas específicas configurado en el entorno.

### 2.1 _Pendiente_

| Campo | Detalle |
|---|---|
| Nombre | |
| Ubicación | |
| Rol | |
| Reglas específicas | |
| Herramientas permitidas | |
| Cuándo se invoca | |
| HU donde se usó | |

## 3. Bitácora de co-creación

### 3.1 Distribución del código

> Estimación de qué porcentaje del código fue sugerido por IA y qué lógica crítica se implementó o corrigió manualmente.
> Se consolida al cierre del proyecto a partir de la tabla por historia.

| Área | % sugerido por IA | % manual / corregido | Notas |
|---|---|---|---|
| Motor de descuentos (dominio) | | | |
| Casos de uso (aplicación) | | | |
| Repositorios en memoria / semilla | | | |
| Controladores, DTOs, filtro de errores | | | |
| CartStore (estado del carrito) | | | |
| Componentes Angular | | | |
| Servicios HTTP / interceptor | | | |
| Pruebas unitarias backend | | | |
| Pruebas unitarias frontend | | | |
| Documentación | | | |

### 3.2 Registro por historia

| HU | Qué generó la IA | Qué se implementó o ajustó manualmente | Observaciones |
|---|---|---|---|
| HU-00 | Redacción de `CLAUDE.md`, `arquitectura.md`, esqueleto de `ia.md` y `README.md` a partir de decisiones tomadas en conversación | Decisiones de stack, patrones, contrato del cupón inválido y tope como cuarta Strategy definidas por el desarrollador | Ver hallazgo 3.4.1 |
| HU-01 | Plan de acción con archivos y dependencias a instalar; archivos raíz del monorepo (`pnpm-workspace.yaml`, `package.json`, `.nvmrc`, `.npmrc`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.prettierrc`, `eslint.config.mjs`); scaffolding con `@nestjs/cli@11` y `@angular/cli@21`; `HealthController` + `IHealthStatus`, `main.ts` con `process.loadEnvFile()` y CORS sin comodín; `CheckoutPageComponent`, rutas y `AppComponent`; migración de vitest a Jest en ambas apps; pruebas unitarias y e2e; README, `CLAUDE.md` y `arquitectura.md` | El desarrollador aprobó las cuatro decisiones propuestas (health sin caso de uso, entorno nativo sin `dotenv`, scope `@cec`, aceptar zoneless), decidió mantener Node 22.22.0 (ver 3.3.1), aprobó el override de `multer` y pidió excluir `docs/historias-usuario.pdf` del repositorio | Ver hallazgos 3.4.2 a 3.4.5. La IA corrigió sobre la marcha dos errores propios: `setupFilesAfterEach` en lugar de `setupFilesAfterEnv`, y escapes de regex en `jest.config.ts` que el lint rechazó (se reemplazaron por `testMatch` con globs) |
| HU-01.1 | Búsqueda previa de `@author`, `@copyright` y del correo y copyright anteriores en el repositorio; reemplazo de los encabezados JSDoc en los cuatro archivos de la HU; nueva convención de encabezado en `CLAUDE.md` §9; esta fila y el hallazgo 3.4.6 | El desarrollador aprobó extender el alcance al campo `author` de los tres `package.json`, que la HU no listaba | Ver hallazgo 3.4.6. Sin cambios de lógica, dependencias ni scripts |
| HU-02 | Contraste de la HU contra `CLAUDE.md` con seis discrepancias señaladas antes de codificar (payload único de quote/checkout, DTOs fuera de `shared`, `ICoupon` fuera de `shared`, `IStockConflict` en el error 409, alcance de `roundMoney` y del mensaje de alerta, categorías cerradas); comparación de cuatro estrategias de consumo del paquete; paquete `@cec/shared` completo (`package.json`, tsconfigs, Jest, ESLint, barrel, 2 enums, 6 constantes, 8 interfaces con JSDoc de precisión monetaria); 3 specs con cobertura 100%; dependencia `workspace:*` en ambas apps, script `dev` raíz y `allowedCommonJsDependencies`; verificación del criterio "un cambio rompe la compilación" con archivos temporales en ambas apps; `arquitectura.md` §10, `CLAUDE.md` §3/§4/§8 y README | El desarrollador aprobó las seis recomendaciones y la opción compilada tras pedir justificar que fuera la más sencilla; preguntó cómo se mantiene una única fuente si los DTOs viven en el backend (respuesta: `implements` sobre la interfaz compartida) | La primera corrida de cobertura quedó en 79.41% porque `DiscountTypeEnum` no lo ejercitaba ninguna prueba (v8 cuenta los enums como funciones); se agregaron specs para ambos enumerables. La IA también corrigió un intento fallido de crear los archivos con heredocs de bash, reemplazándolo por escrituras directas |
| HU-03 | Plan de acción con siete puntos de diseño que la HU dejaba abiertos (puertos asíncronos, `decrementStock` booleano, UUID fijos en la semilla, forma de `IDiscountContext` con `appliedDiscounts`, cálculo de `isCouponValid`, `roundRate` a 4 decimales, `DiscountEngine` sin registrar en Nest) y la recomendación para cerrar la decisión 10.1 con el porcentaje justificado matemáticamente; `roundMoney`/`roundRate` con spec; `ICoupon`, dos puertos con tokens, `IDiscountContext`/`IAppliedDiscount`/`IDiscountStrategy`, utilidades del contexto, cuatro estrategias, `DiscountStrategyFactory`, `DiscountEngine`; semillas de productos y cupones, dos repositorios en memoria, `GetProductsUseCase`, `ProductsController`, providers por token en `AppModule`; 13 specs unitarios (69 pruebas, cobertura 100% de líneas) y e2e de `GET /products`; mocks en `mocks/`; `CLAUDE.md` §2/§4/§7/§8/§10, `arquitectura.md` §4/§8.1/§11, README y esta fila | El desarrollador pidió explicar la matemática del tope antes de decidir, confirmó la opción B con `DEMO30` al 30% ("la funcionalidad intacta y solo agregamos un cupón adicional transversal") y aprobó los siete puntos sin cambios | Ver hallazgo 3.4.1 (cierre) y 3.4.8. La IA corrigió sobre la marcha dos errores propios: un parámetro opcional de constructor en el repositorio `@Injectable` (Nest habría intentado resolverlo) y cuatro `unbound-method` del lint al pasar métodos mockeados a `expect`, reemplazados por aserciones sobre `mock.calls`. Prettier reformateó ocho líneas con `lint:fix` |
| HU-04 | Plan de acción con once puntos que la HU dejaba abiertos (dependencias faltantes, 413 vs 400, cupón vacío, `OrderNotFoundError`, códigos concretos, `CartResolver` compartido, cableado de dominio con `useFactory`, orden del listado, atomicidad validar → decrementar, ubicación de los logs, pipe y filtro como providers) y respuesta a las tres dudas del desarrollador antes de codificar; instalación de `class-validator`, `class-transformer` y `dayjs`; `ErrorCodeEnum`, `BaseError` y cuatro errores de dominio; `consolidateCartItems`, `StockValidator`, `IOrderRepository` con token; `CartResolver`, cuatro casos de uso, `InMemoryOrderRepository`; `ApiExceptionFilter`, fábricas de `ValidationPipe` y excepciones 400, `applyBodySizeLimit`; `CartItemDto` y `CheckoutRequestDto` con mensajes en español; `CheckoutController` y `OrdersController`; providers en `AppModule`; 21 specs unitarios nuevos y 1 actualizado (186 pruebas, 100% de sentencias, funciones y líneas, 91.9% de ramas) y dos e2e nuevos (37 pruebas e2e en total, con helper `createTestingApp`); `CLAUDE.md` §2/§4/§8, `arquitectura.md` §4/§12, README, esta fila, 3.3.2 y 3.4.9 | El desarrollador aprobó las dependencias, eligió `400` para el cuerpo excesivo en lugar del `413` recomendado (ver 3.3.2), aceptó tratar el cupón vacío como ausencia de cupón dejando el aviso al usuario como tarea secundaria, y simplificó el orden del listado a posición de llegada en el arreglo en lugar de ordenar por fecha; pidió aclarar dónde se guarda la fecha (`IOrder.createdAt` como unix en segundos, único uso de `dayjs`), si la atomicidad afectaba la funcionalidad (no) y para qué sirve registrar pipe y filtro en `AppModule` (ver 3.4.9) | Ver hallazgo 3.4.9. La IA corrigió sobre la marcha cinco errores propios detectados por lint o por las pruebas: un `.catch()` en un spec (prohibido por el estándar, reemplazado por `try/catch`), un spy del logger creado antes de compilar el módulo (capturaba el log de arranque de Nest), `import 'reflect-metadata'` faltante en el spec del DTO con `@Type`, tipado `any` en `jest.SpyInstance`/`jest.Mock` y dos imports sin uso tras `lint:fix`. Prettier reformateó ocho archivos con `lint:fix` |

### 3.3 Sugerencias de la IA rechazadas o corregidas

> Mínimo dos ejemplos concretos con el criterio técnico de ingeniería que motivó el rechazo o la corrección.

#### 3.3.1 Actualizar Node para usar Angular 22

| Campo | Detalle |
|---|---|
| HU | HU-01 |
| Sugerencia de la IA | Al fallar `ng new` con Angular CLI 22 ("requires a minimum Node.js version of v22.22.3"), la IA recomendó instalar una versión más reciente de Node 22 con nvm-windows para cumplir "última estable" del `CLAUDE.md`. |
| Problema detectado | La recomendación resolvía el requisito del framework a costa de modificar el entorno de la máquina del desarrollador (versión global de Node) por un cambio de parche, en un proyecto con `.nvmrc` y `engines` recién fijados en 22. |
| Criterio técnico | Estabilidad del entorno y reproducibilidad: la versión de Node es una decisión de plataforma, no del framework. Angular 21 cumple el mínimo acordado (≥ 20), soporta Node 22.12+ y trae zoneless estable; la diferencia con 22 no aporta nada a los criterios evaluados. |
| Decisión final | Mantener Node 22.22.0 y generar el frontend con `@angular/cli@21`. Se documenta en `CLAUDE.md` §3 y `arquitectura.md` §2. |

#### 3.3.2 Responder 413 al cuerpo mayor de 100 KB

| Campo | Detalle |
|---|---|
| HU | HU-04 |
| Sugerencia de la IA | La HU pedía `400` para un cuerpo mayor a 100 KB. La IA señaló que body-parser emite un `413 Payload Too Large`, que es el código semánticamente correcto, y recomendó conservar el `413` con el formato `IApiError`, actualizando la HU y `CLAUDE.md` §8. |
| Problema detectado | La recomendación privilegiaba la semántica HTTP sobre el contrato ya definido con el frontend: la ficha de HU-05 y `CLAUDE.md` §8 establecen que el interceptor muestra los `400`/`409` con su mensaje y los `500`/red con uno genérico; un `413` sería un tercer caso que ninguna historia contempla y que habría que documentar y manejar aparte. |
| Criterio técnico | Consistencia del contrato de errores frente a pureza semántica: el cliente distingue "error de la petición" (4xx de negocio, con mensaje) de "error del servidor"; un cuerpo excesivo es un error de la petición y cae en la primera categoría. El remapeo cuesta una comparación en el filtro (`status === 413`) y mantiene la tabla de errores de la HU sin excepciones. |
| Decisión final | Remapear a `400` con código `CEC_CHECKOUT_1002` y mensaje en español. Registrado en `CLAUDE.md` §8 y `arquitectura.md` §12; el e2e envía un cupón de 110 000 caracteres y verifica el `400`. |

### 3.4 Hallazgos surgidos durante la co-creación

#### 3.4.1 El tope del 35% no es alcanzable con las reglas del enunciado (HU-00)

Al redactar la documentación de arquitectura se calculó el factor máximo de descuento en cascada:
`0.90 × 0.95 × 0.85 = 0.72675` → descuento máximo **27.325%**. Con las tres reglas del enunciado la regla 4 nunca se
activa, por lo que la alerta del 35% (HU-05) no sería observable en la demo. El análisis de opciones y la recomendación
quedaron registrados en `docs/arquitectura.md`, sección 8.1, pendientes de decisión antes de HU-03.

**Cierre (HU-03, 2026-09-09).** Antes de decidir, el desarrollador pidió a la IA explicar la matemática. La IA mostró que
los porcentajes no se suman porque cada regla opera sobre una base cada vez menor (aditivos darían 30%; multiplicativos,
27.325%), derivó el umbral del cupón que sí activa el tope (`0.855 × (1 − r) < 0.65` → r > 23.98%) y comparó 25% (35.875%,
ajuste de centavos) contra 30% (40.15%, ajuste de 66.95 sobre la laptop). El desarrollador confirmó la opción B con
`DEMO30` al 30%, con el criterio de mantener intacta la funcionalidad del enunciado y agregar solo un dato transversal
explicable en la sustentación. Quedó documentado en `CLAUDE.md` §8 (decisión cerrada), `arquitectura.md` §8.1 y en la
propia semilla `coupons.seed.ts`. Las pruebas del motor fijan ambos casos reales: `WELCOME2026` (27.325%, total 944.77) y
`DEMO30` (truncado al 35%, total 844.99).

#### 3.4.9 Lo que `main.ts` configura no existe en las pruebas e2e (HU-04)

Al planificar la HU la IA advirtió que los e2e existentes construyen la aplicación con
`Test.createTestingModule({ imports: [AppModule] })`, sin pasar por `bootstrap()`. Si el `ValidationPipe` y el filtro
global se registraban en `main.ts`, como sugiere la ficha, los e2e de payload corrupto y de formato de error probarían un
comportamiento distinto al de producción. Se registraron como providers `APP_PIPE` y `APP_FILTER` en `AppModule` y el
límite de 100 KB, que es una opción del parser de Express, quedó en `main.ts` mediante un helper reutilizado por el e2e.
Dos detalles surgieron al ejecutar: el error de body-parser por tamaño no es una `HttpException` sino un error con
`status: 413`, así que el filtro lo reconoce por ese campo antes de tratarlo como `500`; y el spec del DTO con `@Type`
necesita `import 'reflect-metadata'` porque corre sin Nest. Los 37 e2e pasaron en la primera ejecución.

#### 3.4.8 v8 también reporta ramas falsas en un controlador con constructor (HU-03)

La cobertura del backend quedó en 100% de sentencias, funciones y líneas, pero `products.controller.ts` marca 60% de
ramas sin tener ningún condicional: el bloque señalado es el constructor con la propiedad `private readonly` inyectada y
el método decorado. Es el mismo fenómeno del hallazgo 3.4.5, ahora con `coverageProvider: 'v8'`, y no ocurre en
`HealthController` porque este no tiene constructor. El umbral global (80%) se cumple con holgura (96.96% de ramas en el
paquete), así que no se tomó ninguna acción; se registra para no perseguir una rama inexistente en HU-04, cuando los
controladores de checkout y órdenes tendrán constructor.

#### 3.4.7 Consolidación del backlog de 25 tickets a 6 historias (tras HU-02)

Con HU-00, HU-01, HU-01.1 y HU-02 publicadas, el desarrollador decidió reducir el backlog para concentrar el tiempo
restante en la funcionalidad demostrable en la sustentación. La IA leyó el documento de historias vigente, lo contrastó
con `CLAUDE.md` y `docs/arquitectura.md`, y propuso el reparto: HU-03 (repositorios, semillas, catálogo y motor de
descuentos completo), HU-04 (validación, cotización, checkout con stock y órdenes) y HU-05 (interfaz completa con los
bloques ordenados por prioridad de demo). Las antiguas HU-23 y HU-24 se disolvieron en una sección de calidad transversal
porque cada historia ya entrega sus pruebas. El desarrollador fijó el número final de historias (primero 10, luego 6) y
las cuatro historias implementadas se conservaron sin cambios. La renumeración se propagó a `CLAUDE.md` (§1, §2, §4, §8 y
§10), `docs/arquitectura.md` (§8.1 y §10), este documento y el `README.md`.

#### 3.4.2 El Nest CLI más reciente ya no genera el stack acordado (HU-01)

`npx @nestjs/cli@latest new` produjo Nest 12 con `"type": "module"`, TypeScript 6, vitest y oxlint. La IA lo detectó al
revisar el `package.json` generado antes de instalar, lo contrastó con `CLAUDE.md` §3 (Nest 11, Jest, ESLint) y regeneró el
proyecto con `@nestjs/cli@11` sin consultar, porque la decisión ya estaba tomada en la documentación. Lección: fijar
siempre la versión mayor del CLI en los comandos de scaffolding.

#### 3.4.3 Angular 22 exige Node 22.22.3 y Corepack no ejecuta pnpm 12 (HU-01)

Dos incompatibilidades del entorno aparecieron en la misma sesión: `ng new` con Angular CLI 22 aborta con Node 22.22.0, y
`corepack enable pnpm` descargó pnpm 12.3.4, cuyo nuevo formato de binario (`bin/pnpm.mjs`) Corepack 0.34 no sabe
ejecutar. Se resolvió fijando `pnpm@10.34.5` en `packageManager` y, por decisión del desarrollador (3.3.1), Angular 21.
Ambas versiones quedan documentadas en `CLAUDE.md` §3 para que el `.nvmrc` y el `packageManager` sean suficientes para
reproducir el entorno.

#### 3.4.4 Avisos de seguridad en dependencias transitivas (HU-01)

`pnpm audit` tras la instalación inicial reportó 3 avisos altos y 1 bajo, todos en `multer` 2.2.0 (transitivo de
`@nestjs/platform-express`). El criterio de la HU (sin críticas) se cumplía, pero la IA propuso un `override` a
`multer >= 2.3.0` en `pnpm-workspace.yaml` y el desarrollador lo aprobó. Resultado: `No known vulnerabilities found`.

#### 3.4.5 istanbul penaliza los métodos decorados (HU-01)

Con un único método `getHealthStatus()` cubierto al 100% en statements, istanbul reportaba 50% de ramas en el controlador:
atribuye una rama no cubierta a la línea de cada método decorado. Con el umbral del 80% eso rompería la cobertura en
cada controlador y componente. Se cambió a `coverageProvider: 'v8'` en ambas apps, que mide sobre el código ejecutado; el
detalle está en `arquitectura.md` §9.

#### 3.4.6 El correo corporativo también estaba en los `package.json` (HU-01.1)

La HU listaba cuatro archivos `.ts` con `@author`/`@copyright` y a la vez exigía cero ocurrencias del correo corporativo anterior en el
repositorio, pero declaraba que no se modificaba configuración. La búsqueda previa mostró que `package.json` (raíz,
backend y frontend) llevaba el campo `author` con ese correo corporativo, generado por los CLI en HU-01. La
IA señaló la contradicción antes de editar y el desarrollador decidió actualizar el campo `author` en los tres
manifiestos, ya que es un metadato descriptivo que no altera dependencias ni comportamiento. Los archivos de sesión
`.pr-preflight-state.json` y `.prepare-pr-*.json` también contenían el correo, pero están en `.gitignore` y no se publican.
