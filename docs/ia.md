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

### 3.3 Sugerencias de la IA rechazadas o corregidas

> Mínimo dos ejemplos concretos con el criterio técnico de ingeniería que motivó el rechazo o la corrección.

#### 3.3.1 _Pendiente_

| Campo | Detalle |
|---|---|
| HU | |
| Sugerencia de la IA | |
| Problema detectado | |
| Criterio técnico | |
| Decisión final | |

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
