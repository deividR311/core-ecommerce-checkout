# Core E-Commerce Checkout — Contexto del proyecto

Prueba técnica Full Stack: MVP de checkout de e-commerce con motor de descuentos acumulativos en cascada, validación de
stock y persistencia de órdenes. Monorepo con backend NestJS, frontend Angular, contratos compartidos y repositorios en
memoria. Se evalúa criterio de ingeniería (arquitectura, patrones, tipado estricto, cobertura ≥ 80%) y gobernanza del
trabajo asistido por IA, en una sustentación en vivo de 20 minutos.

Este archivo complementa los estándares globales del equipo (`~/.claude/CLAUDE.md`: nomenclatura, JSDoc, logs,
SonarQube, arquitectura limpia, pruebas). Aquí van únicamente las decisiones específicas de este proyecto. Ante conflicto,
prevalece este archivo.

## 1. Cómo se trabaja en cada sesión

El desarrollo está dividido en 25 historias de usuario (HU-00 a HU-24). El desarrollador mantiene las fichas completas
en un documento propio y **pega en el chat el texto de la HU a implementar** al inicio de cada sesión.

Protocolo por sesión:

1. Ejecutar `git log --oneline` para identificar la última HU cerrada (el scope del commit lleva el número: `NN-slug`).
2. Leer la HU pegada por el desarrollador y contrastarla con este archivo y con `docs/arquitectura.md`. Si la HU y la
   documentación se contradicen, señalarlo antes de implementar.
3. Revisar la sección **10. Decisiones abiertas**. Si la HU depende de una decisión no cerrada, preguntar antes de codificar.
4. Proponer el plan de acción de la HU (archivos a crear/modificar, pruebas) y esperar confirmación.
5. Implementar **solo el alcance de esa HU**. No adelantar funcionalidad de historias posteriores aunque parezca trivial.
6. Antes de cerrar: pruebas en verde, cobertura del área tocada, autovalidación contra estándares, y registrar en
   `docs/ia.md` (sección 3.2) qué generó la IA y qué ajustó el desarrollador. Si hubo una sugerencia rechazada o
   corregida, registrarla en la sección 3.3 en ese momento.
7. Si la HU obligó a cambiar una decisión de diseño, actualizar este archivo y `docs/arquitectura.md` en el mismo commit.

Commits: **una HU por commit**, formato `tipo(NN-slug): mensaje en español` (ej. `chore(00-init): commit inicial`,
`docs(00-context): documentacion inicial`). Tipos: `chore`, `docs`, `feat`, `test`, `fix`, `refactor`. Sin línea
`Co-Authored-By`. No hacer push salvo indicación explícita.

## 2. Roadmap de historias

| HU | Título | Área |
|---|---|---|
| 00 | Documentación inicial y contexto del proyecto | Base |
| 01 | Estructura base del monorepo | Base |
| 02 | Contratos compartidos de tipado (`packages/shared`) | Base |
| 03 | Repositorio de productos en memoria y datos semilla | Backend |
| 04 | Consulta del catálogo de productos (`GET /products`) | Backend |
| 05 | Núcleo del motor de descuentos (Strategy + Factory) | Backend |
| 06 | Regla de descuento por categoría | Backend |
| 07 | Regla de descuento por volumen | Backend |
| 08 | Regla de descuento por cupón | Backend |
| 09 | Límite absoluto de descuento del 35% | Backend |
| 10 | Validación de payloads y estructura estándar de error | Backend |
| 11 | Cotización del carrito (`POST /checkout/quote`) | Backend |
| 12 | Validación de stock disponible | Backend |
| 13 | Procesamiento y persistencia de la orden (`POST /checkout`) | Backend |
| 14 | Consulta de órdenes persistidas (`GET /orders`, `GET /orders/:id`) | Backend |
| 15 | Listado de productos del catálogo | Frontend |
| 16 | Gestión reactiva del carrito (Observer con signals) | Frontend |
| 17 | Control de stock en la interfaz | Frontend |
| 18 | Aplicación de cupón y desglose de descuentos | Frontend |
| 19 | Alerta de límite máximo de ahorro alcanzado | Frontend |
| 20 | Confirmación de compra | Frontend |
| 21 | Manejo de errores del backend en la interfaz | Frontend |
| 22 | Diseño responsivo | Frontend |
| 23 | Cobertura de pruebas del backend y casos de borde | Calidad |
| 24 | Cobertura de pruebas del frontend y casos de borde | Calidad |

Cada HU tiene criterios funcionales, técnicos y de seguridad; los técnicos y de seguridad de todas las historias están
resumidos en las secciones 5 a 9 de este archivo. Las pruebas unitarias **forman parte de cada HU**, no se dejan para
HU-23/24 (esas historias consolidan cobertura y casos de borde transversales).

## 3. Stack y entorno

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 22 vía nvm-windows. Si `node` no está en el PATH de la terminal, reiniciar la terminal o VS Code. |
| Gestor de paquetes | `pnpm` 10 con workspaces (`apps/*`, `packages/*`), activado con `corepack enable pnpm`. Versión fijada en `packageManager` del `package.json` raíz (Corepack 0.34 no puede ejecutar pnpm 12). `engine-strict=true` en `.npmrc`. Paquetes: `@cec/backend`, `@cec/frontend`, `@cec/shared` |
| Backend | NestJS 11 generado con `@nestjs/cli@11` (el CLI más reciente genera Nest 12 con ESM, vitest y oxlint, que no es el stack acordado). TypeScript `strict` + `noUnusedLocals`, puerto `3000`, **sin prefijo global** de ruta |
| Frontend | Angular 21 (zoneless por defecto): standalone components, signals, SCSS, formularios reactivos, `inject()`, `ChangeDetectionStrategy.OnPush`. Puerto `4200`. Se fijó en 21 porque Angular 22 exige Node ≥ 22.22.3 y el entorno se mantiene en 22.22.0 por decisión del desarrollador. Archivos con sufijo `.component.ts` (schematic `type: component` en `angular.json`) |
| Contratos | `packages/shared` — TypeScript puro, sin dependencias de framework, consumido por ambas apps vía workspace |
| Pruebas | Jest 30 en ambas apps (`jest-preset-angular` con `setupZonelessTestEnv` en frontend). `jest.config.ts` por app con `coverageThreshold` global 80% en statements, branches, functions y lines y `coverageProvider: 'v8'` (istanbul reporta ramas falsas en métodos decorados). Excluidos de cobertura: `main.ts`, `*.interface.ts`, `environments/`, `testing/`. Backend además tiene `test:e2e` (supertest) |
| Lint y formato | `eslint.config.mjs` y `.prettierrc` **en la raíz**, extendidos por cada app (`angular-eslint` en frontend). Prettier impone 2 espacios, comillas simples, punto y coma, `printWidth` 120, `arrowParens: avoid`, LF |
| Validación HTTP | `class-validator` + `class-transformer`; `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted`, `transform` |
| Fechas | `dayjs`. Transporte y persistencia como unix timestamp UTC sin milisegundos; el frontend convierte a local |
| Identificadores | UUID v4 generado en servidor (`crypto.randomUUID()`, sin librería adicional) |
| Estado frontend | Servicio Angular con signals. **Sin NgRx ni ninguna librería de estado** |

Variables de entorno del backend (`apps/backend/.env.example` versionado, `.env` ignorado): `PORT=3000`,
`CORS_ORIGIN=http://localhost:4200`. Se cargan en `main.ts` con `process.loadEnvFile()` nativo de Node 22 (sin `dotenv`
ni `@nestjs/config`); si falta `.env` se usan esos valores por defecto con un `WARN`, y `CORS_ORIGIN='*'` se rechaza
cayendo al origen por defecto. El frontend lee `environment.apiBaseUrl` (`http://localhost:3000` en desarrollo), tipado
con `IEnvironment` en `src/environments/environment.interface.ts`.

No instalar librerías adicionales a las listadas sin consultar. Versionar `.gitattributes` con `* text=auto eol=lf`.
`docs/historias-usuario.pdf` está en `.gitignore` (documento de trabajo del desarrollador). `pnpm-workspace.yaml` lleva
un `override` de `multer >= 2.3.0` (transitivo de `@nestjs/platform-express`) para dejar `pnpm audit` sin avisos.

Comandos desde la raíz (cerrados en HU-01): `pnpm install`, `pnpm dev` (ambas apps en paralelo), `pnpm dev:backend`,
`pnpm dev:frontend`, `pnpm test`, `pnpm test:cov` (ambas apps con cobertura), `pnpm lint`, `pnpm build`. Además
`pnpm --filter @cec/backend test:e2e`. Los scripts raíz delegan con `pnpm --recursive`; cada app expone `dev`, `build`,
`lint`, `test` y `test:cov` con esos nombres exactos.

## 4. Estructura de carpetas

```
core-ecommerce-checkout/
├── apps/
│   ├── backend/src/
│   │   ├── domain/
│   │   │   ├── entities/          # IProduct, IOrder, ICoupon (re-export o extensión de shared) y lógica de entidad
│   │   │   ├── ports/             # IProductRepository, IOrderRepository, ICouponRepository + tokens de inyección
│   │   │   ├── discounts/         # DiscountEngine, DiscountStrategyFactory, IDiscountStrategy, strategies/
│   │   │   ├── services/          # StockValidator
│   │   │   └── errors/            # BaseError, ErrorCodeEnum, errores concretos de dominio
│   │   ├── application/
│   │   │   └── use-cases/         # GetProductsUseCase, QuoteCartUseCase, ProcessCheckoutUseCase, GetOrders*, ...
│   │   ├── infrastructure/
│   │   │   ├── persistence/       # InMemory*Repository
│   │   │   ├── seed/              # products.seed.ts, coupons.seed.ts
│   │   │   └── http/              # Filtro global de excepciones, mapeo error → status
│   │   └── presentation/
│   │       ├── controllers/       # HealthController, ProductsController, CheckoutController, OrdersController
│   │       ├── dto/               # CartItemDto, CheckoutRequestDto (class-validator)
│   │       └── interface/         # Interfaces propias del borde HTTP (IHealthStatus)
│   └── frontend/src/
│       ├── app/                   # app.component.ts (solo <router-outlet />), app.config.ts, app.routes.ts
│       ├── app/checkout/
│       │   ├── components/        # Componentes standalone *.component.ts, sin lógica de negocio (CheckoutPageComponent)
│       │   ├── services/          # ProductsService, CheckoutService, NotificationService, interceptor de errores
│       │   ├── state/             # CartStore
│       │   └── interface/         # Interfaces exclusivas del frontend (*.interface.ts)
│       ├── environments/          # environment.ts (apiBaseUrl) + environment.interface.ts (IEnvironment)
│       └── testing/mocks/         # mock[Entidad] + barrel index.ts
├── packages/shared/src/
│   ├── interfaces/                # *.interface.ts
│   ├── enums/                     # *.enumerable.enum.ts
│   ├── constants/                 # discount.constants.ts, alert.constants.ts
│   └── utils/                     # money.util.ts (roundMoney)
├── docs/                          # arquitectura.md, ia.md, historias-usuario.pdf (documento del desarrollador)
├── CLAUDE.md
└── README.md
```

Archivos de prueba `*.spec.ts` junto al archivo que prueban. Mocks del backend en carpeta `mocks/` dentro del módulo
que los usa; mocks del frontend centralizados en `src/testing/mocks/`.

## 5. Reglas de dependencia entre capas (backend)

- `domain` no importa nada de `application`, `infrastructure`, `presentation` ni de `@nestjs/*`. Sin decoradores.
- `application` depende solo de `domain` (y de `@nestjs/common` únicamente para `@Injectable`/`@Inject`). Nunca de `infrastructure`.
- `presentation` invoca **únicamente casos de uso**. Un controlador que inyecte un repositorio o contenga una regla de
  negocio es una violación severa. Única excepción documentada: `HealthController` responde `{ status: 'ok' }` sin caso
  de uso porque no hay dominio que orquestar (ver `docs/arquitectura.md` §9).
- Repositorios inyectados por token (`Symbol` o string constante exportada junto al puerto) contra su interfaz.
- Los casos de uso no contienen reglas matemáticas: resuelven datos por los puertos, arman el contexto y delegan en dominio.

## 6. Patrones de diseño acordados

| Patrón | Dónde | Cómo |
|---|---|---|
| **Strategy** | `domain/discounts` | `IDiscountStrategy { apply(context: IDiscountContext): IDiscountContext }`. Una clase por regla: `CategoryDiscountStrategy`, `VolumeDiscountStrategy`, `CouponDiscountStrategy`, `MaxDiscountCapStrategy`. Cada una devuelve un contexto **nuevo e inmutable** con su descuento registrado. |
| **Factory** | `domain/discounts` | `DiscountStrategyFactory.createChain(): IDiscountStrategy[]` declara el orden de precedencia. `DiscountEngine.calculate(context)` hace `reduce` sobre la cadena sin conocer clases concretas. El tope del 35% es **la última estrategia**, nunca lógica suelta en el motor. |
| **Observer** | `frontend/state` | `CartStore` con signals: estado privado (`_items`, `_breakdown`, `_couponCode`), selectores `computed` (`items`, `originalSubtotal`, `totalUnits`, `availableStockFor`, `breakdown`, `isBreakdownStale`, `isMaxDiscountReached`, `canCheckout`) y métodos de mutación explícitos (`addProduct`, `increment`, `decrement`, `remove`, `clear`, `setBreakdown`). Los componentes leen selectores; ninguno guarda copia local del estado. |

Adicionales presentes (no se cuentan como "los dos patrones" en la defensa): Ports & Adapters para repositorios, DTO + Pipe
en el borde HTTP.

## 7. Reglas de negocio del motor de descuentos

Cálculo **secuencial y multiplicativo**: cada regla opera sobre el resultado de la anterior, nunca aditivo sobre el original.

1. **Categoría**: 10% solo sobre ítems de categoría `TECHNOLOGY` (precio unitario × cantidad de esos ítems).
2. **Volumen**: 5% sobre todo el carrito si el subtotal **post-categoría** es **estrictamente mayor** a 100 (100 exacto no aplica).
3. **Cupón**: porcentaje del cupón (15% para `WELCOME2026`) sobre el total post-volumen, si el cupón existe y está activo.
4. **Tope**: el descuento total nunca supera el 35% del subtotal original. Si lo supera, se trunca **exactamente** al 35%:
   `finalTotal = originalSubtotal × 0.65`, y la respuesta lleva `isMaxDiscountReached: true` y el ajuste en `capAdjustment`.

Constantes en `packages/shared/constants/discount.constants.ts` (nunca literales en las estrategias):
`CATEGORY_DISCOUNT_RATE = 0.10`, `VOLUME_DISCOUNT_RATE = 0.05`, `VOLUME_THRESHOLD = 100`,
`MAX_DISCOUNT_RATE = 0.35`, `DISCOUNT_TARGET_CATEGORY = ProductCategoryEnum.TECHNOLOGY`. El 15% del cupón vive en el
dato del cupón (semilla), no en una constante de regla.

Precisión monetaria: los pasos intermedios conservan precisión completa; `roundMoney` (2 decimales) se aplica **solo** al
construir el `IDiscountBreakdown` final. La comparación contra el tope usa `FLOAT_TOLERANCE = 1e-9` para que un 35%
exacto **no** se considere superado. Carrito vacío → desglose en ceros, sin excepción.

## 8. Contratos y decisiones cerradas

### Contratos (`packages/shared`)

- `IProduct { id, name, unitPrice, category: ProductCategoryEnum, stock }`
- `ICartItem { productId, quantity }`
- `ICheckoutRequest { items: ICartItem[], couponCode?: string }` — el cliente **nunca** envía precios ni totales.
- `IDiscountBreakdown { originalSubtotal, categoryDiscount, volumeDiscount, couponDiscount, capAdjustment, totalDiscount,
  effectiveDiscountRate, finalTotal, isMaxDiscountReached, isCouponValid }` — montos con 2 decimales; tasas como fracción.
- `IOrder { id, createdAt (unix UTC), items: IOrderItem[], couponCode: string | null, breakdown: IDiscountBreakdown, finalTotal }`
- `IOrderItem { productId, name, unitPrice, quantity }` — precio al momento de la compra.
- `ICoupon { code, discountRate, isActive }` — solo en backend; el cliente nunca recibe cupones.
- `IApiError { error: { code: string, message: string } }`
- `ProductCategoryEnum { TECHNOLOGY, HOME, CLOTHING, BOOKS, ... }`, `DiscountTypeEnum { CATEGORY, VOLUME, COUPON, CAP }`
- `MAX_DISCOUNT_ALERT_MESSAGE = '¡Enhorabuena! Has alcanzado el límite máximo de ahorro permitido (35%)'` — constante única,
  usada por el componente y sus pruebas.

### Endpoints (sin prefijo global)

| Método | Ruta | HU | Éxito | Errores |
|---|---|---|---|---|
| GET | `/health` | 01 | 200 `{ status: 'ok' }` | — |
| GET | `/products` | 04 | 200 `IProduct[]` | — |
| POST | `/checkout/quote` | 11 | 200 `IDiscountBreakdown` — **no muta estado**; cupón inválido → `isCouponValid: false` | 400, 404 |
| POST | `/checkout` | 13 | 201 `IOrder` | 400 (payload o cupón inválido), 404, 409 (stock) |
| GET | `/orders` | 14 | 200 `IOrder[]` (más reciente primero) | — |
| GET | `/orders/:id` | 14 | 200 `IOrder` | 400 (no UUID), 404 |

### Decisiones cerradas

- **Cálculo autoritativo en servidor.** Precios, descuentos, totales, stock y validez de cupón se resuelven solo en el
  servidor a partir de sus repositorios. El frontend calcula localmente únicamente el subtotal original como dato informativo.
- **Cupón inválido**: tolerado en `quote` (se cotiza sin la regla 3 e `isCouponValid: false`); rechazado en `checkout`
  con `400` sin persistir nada. Normalización: `trim` + mayúsculas, longitud máxima 32, patrón alfanumérico.
- **Orden de ejecución en checkout**: resolver productos → resolver cupón → validar stock → calcular → decrementar stock →
  persistir. Toda validación antes de cualquier mutación; si algo falla, ningún stock queda decrementado.
- **Stock insuficiente** → `409` listando **todos** los conflictos `{ productId, requested, available }`. Ítems repetidos se
  consolidan por `productId` antes de validar. El decremento nunca deja stock negativo.
- **Errores de dominio**: `BaseError extends Error { readonly code: ErrorCodeEnum }` en `domain/errors`. El dominio **no**
  conoce códigos HTTP; el filtro global en `infrastructure/http` mapea clase → status: `ProductNotFoundError` → 404,
  `InvalidCouponError` → 400, `InsufficientStockError` → 409, errores de validación de Nest → 400, resto → 500 con
  mensaje genérico. Nunca stack traces hacia el cliente.
- **Códigos de error**: `CEC_{MODULO}_{CONSECUTIVO}` en `ErrorCodeEnum`; consecutivo 1xxx presentación, 2xxx aplicación,
  3xxx dominio. Módulos: `PRODUCTS`, `CHECKOUT`, `ORDERS`, `DISCOUNTS`.
- **Límites de entrada**: máximo 50 ítems por carrito, cantidad entera entre 1 y 999, cuerpo máximo 100 KB.
- **Alerta del 35%** en frontend se enciende solo con `isMaxDiscountReached` del servidor; el frontend no compara montos.
  Es persistente (sin auto-cierre), distinta de errores e info, con `role="status"` y `aria-live`.
- **Invalidación del desglose**: cualquier mutación del carrito pone `isBreakdownStale = true`; la alerta se apaga y
  "Pagar" se deshabilita hasta volver a cotizar. `canCheckout = items.length > 0 && breakdown && !isBreakdownStale`.
- **Tras un checkout exitoso**: vaciar carrito, limpiar cupón, recargar catálogo (stock actualizado), mostrar confirmación
  con los totales **devueltos por el servidor**, no los de la cotización previa.
- **Manejo de errores en frontend**: interceptor HTTP normaliza toda respuesta (incluido fallo de red) a `IApiError`;
  `NotificationService` centraliza mensajes; los `400`/`409` de negocio se muestran con su mensaje, `500`/red con mensaje
  genérico. Detalles solo en consola en desarrollo, nunca el payload.

## 9. Convenciones específicas de código y pruebas

- Vocabulario del dominio en identificadores: `product`, `cartItem`, `quote`, `breakdown`, `discountContext`, `order`,
  `coupon`/`couponCode`, `stock`/`availableStock`. Nunca calificadores genéricos (`data`, `item`, `entity`, `business`).
- Todo elemento interactivo o de resultado en Angular lleva `data-test` con formato `[tipo]-[identificador]-[contenedor]`
  (`action-add-{productId}-page`, `input-coupon-panel`, `action-apply-coupon-panel`, `div-max-discount-alert-panel`,
  `action-checkout-panel`). Las pruebas localizan elementos por `data-test`, nunca por clases CSS.
- Renderizado por interpolación; nunca `innerHTML`. `::ng-deep` solo precedido de `:host`. Breakpoint móvil `768px`.
- Nada de orden ni carrito en `localStorage`/`sessionStorage`.
- Pruebas: un `describe` por archivo (`Clase: proceso`), `it` en español "debería [resultado] cuando [condición]",
  validar retornos y estado (no solo invocaciones), datos representativos del dominio (`'Laptop Pro 14'`, `1299.99`),
  mocks con sufijo `Mock` y spies con sufijo `Spy`. Las pruebas del motor verifican montos exactos a 2 decimales.
- Casos de borde obligatorios que deben existir al cerrar el proyecto: tope 35% exacto (no trunca) y superado (trunca),
  carrito vacío en quote y checkout, payload corrupto (cantidades ≤ 0, decimales, ids inexistentes, campos extra),
  cupón inexistente/inactivo/vacío, stock insuficiente en uno y varios ítems, stock exacto.
- Logs (backend): `Clase > metodo - mensaje` con `error.message`, nunca el objeto de error ni el cuerpo de la petición.
- Encabezado JSDoc de clase (HU-01.1): toda clase en `apps/` y `packages/` lleva exactamente este bloque, con guion largo
  (`–`) entre nombre y correo. **Prevalece sobre el `@author`/`@copyright` del estándar global del equipo**
  (`~/.claude/CLAUDE.md`); ninguna historia debe reintroducir el correo corporativo ni el copyright anteriores. El campo `author`
  de los `package.json` usa la misma identidad (`Johan Rodriguez <deicen24@gmail.com>`).
  ```typescript
  /**
   * @class NombreDeLaClase
   * @author Johan Rodriguez – deicen24@gmail.com
   * @copyright Davivienda-2026
   */
  ```

## 10. Decisiones abiertas

**10.1 — El tope del 35% no es alcanzable con las reglas del enunciado.** Factor máximo en cascada
`0.90 × 0.95 × 0.85 = 0.72675` → descuento máximo **27.325%**. Con datos reales la regla 4 nunca se activa y la alerta
de HU-19 no sería observable en la demo. Opciones y recomendación (cupón adicional de demostración con porcentaje
suficiente, manteniendo `WELCOME2026` como el del enunciado) en `docs/arquitectura.md` §8.1. **Debe cerrarse antes de
implementar HU-03 (semilla) y HU-08 (cupón)**; si al llegar a esas HU sigue abierta, preguntar al desarrollador.

Al cerrar una decisión: moverla a la sección 8 como cerrada, actualizar `docs/arquitectura.md` y registrar el hallazgo
en `docs/ia.md` §3.4.
