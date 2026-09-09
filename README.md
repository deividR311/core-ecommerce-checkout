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
| Backend | NestJS 11 · TypeScript strict · Jest |
| Frontend | Angular (standalone components + signals) · SCSS · Jest |
| Contratos compartidos | `packages/shared` (TypeScript puro) |
| Persistencia | Repositorios en memoria |
| Monorepo | pnpm workspaces · Node.js 22 |

## Estructura

```
core-ecommerce-checkout/
├── apps/
│   ├── backend/          # API REST (NestJS) — dominio, aplicación, infraestructura, presentación
│   └── frontend/         # Aplicación web (Angular) — carrito, cupón, desglose, confirmación
├── packages/
│   └── shared/           # Interfaces, enumerables y constantes del dominio compartidas
├── docs/
│   ├── historias-usuario.pdf   # Historias HU-00 a HU-24 con criterios funcionales, técnicos y de seguridad
│   ├── arquitectura.md         # Decisiones de diseño, patrones, trade-offs y principios de seguridad
│   └── ia.md                   # Gobernanza y bitácora de co-creación con IA
├── CLAUDE.md             # Contexto del proyecto para sesiones asistidas por IA
└── README.md
```

## Documentación

- [Historias de usuario](docs/historias-usuario.pdf)
- [Arquitectura](docs/arquitectura.md)
- [Gobernanza de IA](docs/ia.md)

## Instalación, ejecución y pruebas

_Pendiente: se completa en HU-01 una vez exista el scaffold de las aplicaciones (requisitos, variables de entorno,
comandos de arranque y de cobertura de pruebas)._
