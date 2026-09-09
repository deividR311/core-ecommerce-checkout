# Core E-Commerce Checkout

MVP de checkout de e-commerce con motor de descuentos acumulativos. Prueba técnica Full Stack.

## Problema

Módulo de checkout que permite gestionar un carrito de compras y aplicar descuentos acumulativos en cascada con
orden de precedencia y un tope absoluto:

1. **Categoría**: 10% sobre los productos de la categoría Tecnología.
2. **Volumen**: 5% adicional sobre todo el carrito si el subtotal (tras el descuento de categoría) supera $100 USD.
3. **Cupón**: 15% adicional sobre el total anterior con el cupón `WELCOME2026`.
4. **Tope**: el descuento total nunca supera el 35% del valor original; si lo hace, se trunca exactamente al 35%.

El backend valida stock, calcula el desglose exacto, decrementa inventario y persiste la orden. El frontend permite
armar el carrito en tiempo real, aplicar el cupón, ver el desglose completo y recibe una alerta cuando se alcanza el
tope de ahorro.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | NestJS 11 · TypeScript strict · Jest 30 |
| Frontend | Angular 21 (standalone components, signals, zoneless) · SCSS · Jest 30 + jest-preset-angular |
| Contratos compartidos | `packages/shared` (TypeScript puro) |
| Persistencia | Repositorios en memoria |
| Monorepo | pnpm 10 workspaces · Node.js 22 · ESLint 9 + Prettier compartidos |

## Estructura

```
core-ecommerce-checkout/
├── apps/
│   ├── backend/          # API REST (NestJS) — src/{domain,application,infrastructure,presentation}
│   └── frontend/         # Aplicación web (Angular) — src/app/checkout/{components,services,state,interface}
├── packages/
│   └── shared/           # Interfaces, enumerables y constantes del dominio compartidas (HU-02)
├── docs/
│   ├── arquitectura.md   # Decisiones de diseño, patrones, trade-offs y principios de seguridad
│   └── ia.md             # Gobernanza y bitácora de co-creación con IA
├── CLAUDE.md             # Contexto del proyecto para sesiones asistidas por IA
└── README.md
```

Las historias de usuario (HU-00 a HU-24) se mantienen en un documento de trabajo del desarrollador que no se versiona.

## Documentación

- [Arquitectura](docs/arquitectura.md)
- [Gobernanza de IA](docs/ia.md)

## Requisitos

- Node.js 22 (versión fijada en `.nvmrc`; con nvm-windows: `nvm use 22`).
- pnpm 10, habilitado con Corepack: `corepack enable pnpm`. La versión exacta está fijada en el campo
  `packageManager` del `package.json` raíz.

## Instalación

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env
```

Variables de entorno del backend (`apps/backend/.env`, no versionado):

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto HTTP del backend |
| `CORS_ORIGIN` | `http://localhost:4200` | Único origen permitido para CORS. El comodín `*` se rechaza |

Si el archivo `.env` no existe, el backend arranca con esos valores por defecto y lo advierte en el log.

## Ejecución

| Comando | Descripción |
|---|---|
| `pnpm dev` | Levanta backend (`http://localhost:3000`) y frontend (`http://localhost:4200`) en paralelo |
| `pnpm dev:backend` | Solo backend, con recarga en caliente |
| `pnpm dev:frontend` | Solo frontend, con recarga en caliente |
| `pnpm build` | Compila ambas aplicaciones |

Comprobación rápida del backend: `GET http://localhost:3000/health` responde `200 { "status": "ok" }`.

## Pruebas y calidad

| Comando | Descripción |
|---|---|
| `pnpm test` | Pruebas unitarias de ambas aplicaciones |
| `pnpm test:cov` | Pruebas unitarias con reporte de cobertura; umbral global del 80% en statements, branches, functions y lines |
| `pnpm lint` | ESLint (con Prettier) en ambas aplicaciones |
| `pnpm --filter @cec/backend test:e2e` | Pruebas end-to-end del backend (HTTP real con supertest) |
| `pnpm audit` | Auditoría de dependencias; el proyecto se mantiene sin vulnerabilidades conocidas |

Los reportes de cobertura quedan en `apps/backend/coverage` y `apps/frontend/coverage`.
