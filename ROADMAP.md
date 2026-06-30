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

## Fases

### 🟦 Fase 1 — Núcleo full-stack JS/TS (ACTIVA — empezamos aquí)
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

### 🟩 Fase 2 — Backend + datos
**Duración orientativa:** 8–10 semanas.

- 🔵 Primario: **Python** (+ FastAPI)
- 🟢 Secundario: **SQL & bases de datos**
- ⚪ Mantenimiento (rotando): TS/React/Node (ya no primario, pero activo),
  Fundamentos (Docker/CI sube de intensidad), Java, .NET, Rails

**Criterio de salida:** Python en 🟨/🟩 + SQL en 🟨, puedo construir una API
con persistencia real, tests y Docker, sin guía.

### 🟪 Fase 3 — Especialización en IA aplicada
**Duración orientativa:** 8–12 semanas.

- 🔵 Primario: **Machine Learning / IA** (foco en LLMs + RAG + MLOps, no solo
  ML clásico)
- 🟢 Secundario: **Fundamentos** (CI/CD, Docker, despliegue — necesario para
  servir modelos en producción)
- ⚪ Mantenimiento (rotando): todo lo demás, 1/semana

**Criterio de salida:** puedo llevar un modelo/LLM de notebook a un endpoint
servido con FastAPI + Docker, con evaluación básica de calidad de salida.

### 🟫 Continuo (todas las fases)
Java, .NET y Ruby on Rails se mantienen vivos con 1 ejercicio/semana cada uno
en rotación, para no perder el músculo. Si tu objetivo de trabajo es
**enterprise** (banca, seguros, gobierno), sube **Java o .NET** a secundario
en la Fase 2. Si es **producto/startup**, sube **Rails** antes.

## Cómo usar este archivo con Claude Code
- Antes de generar un ejercicio sin track explícito, Claude debe leer la fase
  ACTIVA aquí arriba y respetar la distribución 🔵/🟢/⚪.
- Cuando uses `siguiente fase`, Claude revisa el criterio de salida de la fase
  activa contra `progress/tracker.md` y, si se cumple, marca la siguiente fase
  como ACTIVA (edita este archivo).
