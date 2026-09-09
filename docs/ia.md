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

#### 3.3.2 _Pendiente_

| Campo | Detalle |
|---|---|
| HU | |
| Sugerencia de la IA | |
| Problema detectado | |
| Criterio técnico | |
| Decisión final | |

### 3.4 Hallazgos surgidos durante la co-creación

#### 3.4.1 El tope del 35% no es alcanzable con las reglas del enunciado (HU-00)

Al redactar la documentación de arquitectura se calculó el factor máximo de descuento en cascada:
`0.90 × 0.95 × 0.85 = 0.72675` → descuento máximo **27.325%**. Con las tres reglas del enunciado la regla 4 nunca se
activa, por lo que la alerta de HU-19 no sería observable en la demo. El análisis de opciones y la recomendación
quedaron registrados en `docs/arquitectura.md`, sección 8.1, pendientes de decisión antes de HU-03 y HU-08.

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
