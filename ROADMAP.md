# ROADMAP — Coding Gym

Stack y plan de fases, calibrados a la demanda de mercado 2026 y a hacia dónde
va la tendencia (IA aplicada subiendo fuerte, lo "enterprise clásico" estable
pero sin crecer, el núcleo JS/TS+Python como base no-negociable).

## Lógica del stack (por qué este orden y no otro)

1. **TypeScript + React/Next.js + Node** van primero porque son sinérgicos
   (mismo lenguaje, mismo ecosistema) y concentran el mayor volumen de
   vacantes full-stack del mercado ahora mismo.
2. **Python + SQL** entran después como el segundo pilar: Python es el
   lenguaje #1 en demanda general y la puerta de entrada obligatoria a IA/ML;
   SQL es la habilidad más durable y transversal a todo backend/datos.
3. **Machine Learning / IA aplicada** es la fase de mayor retorno futuro: la
   tendencia no es "ML clásico" sino **LLMs + RAG + MLOps** (despliegue real,
   no solo notebooks). Es donde está la prima salarial más alta y el
   crecimiento más rápido proyectado.
4. **Java, .NET y Ruby on Rails** se mantienen "tibios" (1 ejercicio/semana
   rotando) desde el día uno, no se abandonan: siguen siendo pedidos en
   enterprise (Java/.NET) y en startups de prototipado rápido (Rails), pero no
   están creciendo tan rápido como el núcleo JS/TS+Python+IA, así que no
   justifican ser primarios todavía.
5. **Fundamentos (Git, Docker, testing, CI/CD, diseño de sistemas)** corren en
   paralelo SIEMPRE: son lo que de verdad separa junior de mid en cualquier
   stack, así que nunca bajan de mantenimiento activo.

## El stack

| # | Track | Núcleo | Frameworks / herramientas clave | Rol en el plan |
|---|---|---|---|---|
| 1 | TypeScript | TS/JS | tipos avanzados, Zod | Base del núcleo full-stack |
| 2 | React + Next.js | TS | React 19, App Router, RSC, Server Actions, Tailwind | Frontend #1 + meta-framework de facto |
| 3 | Node backend | Node.js (TS) | Express/Fastify, NestJS, REST, auth | Runtime backend #1 |
| 4 | Python | Python | typing, pytest, FastAPI | Lenguaje #1 en demanda; puente a IA |
| 5 | SQL & bases de datos | SQL | PostgreSQL, índices, modelado, ORMs | Habilidad transversal más durable |
| 6 | Machine Learning / IA | Python | NumPy, pandas, scikit-learn, PyTorch, Hugging Face, LangChain, RAG, vector DBs, MLOps | Mayor crecimiento y prima salarial futura |
| 7 | Fundamentos | — | Git, Docker, testing, CI/CD, diseño de sistemas, algoritmos | Transversal, siempre activo |
| 8 | Java | Java | Spring Boot, JUnit | Mantenimiento — enterprise/finanzas |
| 9 | C# / .NET | C# | ASP.NET Core, EF Core, xUnit | Mantenimiento — enterprise Microsoft |
| 10 | Ruby on Rails | Ruby | Rails, RSpec | Mantenimiento — startups/prototipado |

## Paths

Este repo ya no asume una única progresión lineal para todo el mundo: cada
persona que lo use elige uno de estos 3 paths con el comando `elegir path`
(ver `CLAUDE.md`). Cada path tiene su propia secuencia de fases, de **Junior a
Senior**. Fundamentos y el mantenimiento rotativo de Java/.NET/Rails corren
igual en los 3 paths (ver sección "Continuo" al final).

| # | Path | Enfoque | Para quién es |
|---|---|---|---|
| 1 | **Full-stack Web** | TypeScript → React/Next.js → Node backend | Quiere el rol full-stack de mayor demanda ahora mismo; le da igual frontend o backend, quiere ambos |
| 2 | **Backend & Datos** | Python (+FastAPI) → SQL & bases de datos | Se inclina por backend/datos, quiere una base sólida antes de (opcionalmente) saltar a IA después |
| 3 | **IA Aplicada** | Python + ML/LLMs/RAG → Fundamentos de despliegue (MLOps) | Ya tiene una base de programación razonable y quiere ir directo a IA aplicada, no ML clásico de notebook |

Un mismo track (p. ej. Python) puede aparecer en más de un path — lo que
cambia es el **rol** que juega (primario vs. paso previo) y qué viene después.
Se puede cambiar de path en cualquier momento con `elegir path`; el progreso
ya hecho en otros tracks no se pierde, solo deja de ser prioridad.

## Fases por path

Cada path tiene una fase **Junior→Mid** (llegar a producción sin guía) y una
fase **Mid→Senior** (diseño, ambigüedad, liderazgo técnico — ver Rúbrica
Mid→Senior en `CLAUDE.md`). La fase activa de cada path se registra en
`progress/tracker.md`.

### Path 1 — Full-stack Web

#### 🟦 Junior→Mid (empieza aquí si el path recién se eligió)
**Duración orientativa:** 8–10 semanas.

- 🔵 Primario: **TypeScript** → en cuanto tengas 🟨 sólido en tipos/async, el
  primario rota a **React + Next.js** (la base de TS no se abandona, sigue de
  secundario).
- 🟢 Secundario: **Node backend**
- ⚪ Mantenimiento (rotando, 1/semana cada uno): SQL, Python, Fundamentos
  (Git/Docker desde ya), Java, .NET, Rails

**Criterio de salida:** TypeScript en 🟨 estable + React/Next en 🟨 + Node en
🟥→🟨, y puedo armar un mini full-stack (frontend Next + API Node) end-to-end
sin guía.

#### 🟦 Mid→Senior
**Duración orientativa:** 8–12 semanas, no tiene fin fijo — es mejora continua.

- 🔵 Primario: diseño de arquitectura frontend/backend (RSC vs. client
  components, estrategias de cache, límites de servicio, contratos de API)
- 🟢 Secundario: performance a escala (Core Web Vitals, N+1, rate limiting,
  observabilidad) y mentoring (revisar código/diseño de un compañero real o
  de `solutions/` de otros tracks)
- ⚪ Mantenimiento: igual que antes, rotando

**Criterio de salida (no hay "salida" real, pero para pasar a mantenimiento
sostenido):** puedo tomar un requerimiento ambiguo de negocio, proponerlo
como RFC corto con alternativas descartadas, implementarlo full-stack, y
dejarlo documentado para que otra persona lo opere sin preguntarme.

### Path 2 — Backend & Datos

#### 🟩 Junior→Mid (empieza aquí si el path recién se eligió)
**Duración orientativa:** 8–10 semanas.

- 🔵 Primario: **Python** (+ FastAPI)
- 🟢 Secundario: **SQL & bases de datos**
- ⚪ Mantenimiento (rotando): TS/React/Node, Fundamentos (Docker/CI sube de
  intensidad), Java, .NET, Rails

**Criterio de salida:** Python en 🟨/🟩 + SQL en 🟨, puedo construir una API
con persistencia real, tests y Docker, sin guía.

#### 🟩 Mid→Senior
**Duración orientativa:** 8–12 semanas, mejora continua.

- 🔵 Primario: diseño de datos y servicios (modelado para escala, migraciones
  sin downtime, particionamiento/índices, consistencia vs. disponibilidad)
- 🟢 Secundario: operabilidad (observabilidad, SLOs, manejo de incidentes) y
  mentoring (revisar esquemas/PRs ajenos)
- ⚪ Mantenimiento: igual que antes, rotando

**Criterio de salida:** puedo diseñar el modelo de datos y la arquitectura de
un servicio nuevo desde un requerimiento ambiguo, documentar los tradeoffs, y
anticipar cómo falla bajo carga o con datos corruptos.

### Path 3 — IA Aplicada

#### 🟪 Junior→Mid (empieza aquí si el path recién se eligió)
**Duración orientativa:** 8–12 semanas.

- 🔵 Primario: **Machine Learning / IA** (foco en LLMs + RAG + MLOps, no solo
  ML clásico)
- 🟢 Secundario: **Fundamentos** (CI/CD, Docker, despliegue — necesario para
  servir modelos en producción)
- ⚪ Mantenimiento (rotando): todo lo demás, 1/semana

**Criterio de salida:** puedo llevar un modelo/LLM de notebook a un endpoint
servido con FastAPI + Docker, con evaluación básica de calidad de salida.

#### 🟪 Mid→Senior
**Duración orientativa:** 8–12 semanas, mejora continua.

- 🔵 Primario: diseño de sistemas de IA (elección de arquitectura RAG vs.
  fine-tuning vs. prompting, evaluación rigurosa de calidad, costo/latencia)
- 🟢 Secundario: MLOps a escala (versionado de modelos/datos, monitoreo de
  drift, rollback seguro) y mentoring (revisar pipelines/prompts ajenos)
- ⚪ Mantenimiento: igual que antes, rotando

**Criterio de salida:** puedo diseñar y justificar por escrito la arquitectura
de un sistema de IA de punta a punta (datos → modelo/prompt → evaluación →
producción), incluyendo qué alternativas descarté y por qué.

## Continuo (todos los paths, todas las fases)
Java, .NET y Ruby on Rails se mantienen vivos con 1 ejercicio/semana cada uno
en rotación, para no perder el músculo, sin importar el path elegido. Si tu
objetivo de trabajo es **enterprise** (banca, seguros, gobierno), sube **Java
o .NET** a secundario. Si es **producto/startup**, sube **Rails** antes.

## Cómo usar este archivo con Claude Code
- Antes de generar un ejercicio sin track explícito, Claude debe leer el path
  elegido y su fase ACTIVA en `progress/tracker.md`, y respetar la
  distribución 🔵/🟢/⚪ de esa fase.
- Cuando uses `elegir path`, Claude escribe el path elegido en
  `progress/tracker.md` y aplica la distribución de su fase Junior→Mid (salvo
  que `determinar nivel` ya haya confirmado nivel Mid o superior, en cuyo
  caso arranca directo en Mid→Senior).
- Cuando uses `siguiente fase`, Claude revisa el criterio de salida de la fase
  activa DENTRO del path elegido contra `progress/tracker.md` y, si se
  cumple, marca la siguiente fase de ese path como ACTIVA (edita este
  archivo).
