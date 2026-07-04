# ROADMAP — Coding Gym

Stack and phase plan, calibrated to 2026 market demand and where the trend is
heading (applied AI rising fast, "classic enterprise" stable but not
growing, the JS/TS+Python core as a non-negotiable base).

## Stack rationale (why this order and not another)

1. **TypeScript + React/Next.js + Node** come first because they're
   synergistic (same language, same ecosystem) and concentrate the largest
   volume of full-stack openings in the market right now.
2. **Python + SQL** come next as the second pillar: Python is the #1
   language in overall demand and the mandatory gateway into AI/ML; SQL is
   the most durable and transversal skill across all backend/data work.
3. **Applied Machine Learning / AI** is the phase with the highest future
   return: the trend isn't "classic ML" but **LLMs + RAG + MLOps** (real
   deployment, not just notebooks). It's where the highest salary premium
   and fastest projected growth are.
4. **Java, .NET, and Ruby on Rails** stay "warm" (1 exercise/week rotating)
   from day one, never abandoned: they're still in demand in enterprise
   (Java/.NET) and fast-prototyping startups (Rails), but they aren't
   growing as fast as the JS/TS+Python+AI core, so they don't justify being
   primary yet.
5. **Fundamentals (Git, Docker, testing, CI/CD, systems design)** run in
   parallel ALWAYS: they're what truly separates junior from mid in any
   stack, so they never drop below active maintenance.

## Paths

This repo no longer assumes a single linear progression for everyone: each
person who uses it picks one of these 3 paths with the `choose path` command
(see `CLAUDE.md`). Each path defines its own phase sequence, from **Junior to
Senior**. Fundamentals and the rotating maintenance of Java/.NET/Rails run
the same across all 3 paths (see the "Ongoing" section at the end).

| # | Path | Focus | Who it's for |
|---|---|---|---|
| 1 | **Full-stack Web** | TypeScript → React/Next.js → Node backend | Wants the highest-demand full-stack role right now; doesn't mind frontend or backend, wants both |
| 2 | **Backend & Data** | Python (+FastAPI) → SQL & databases | Leans toward backend/data, wants a solid base before (optionally) jumping to AI later |
| 3 | **Applied AI** | Python + ML/LLMs/RAG → Deployment fundamentals (MLOps) | Already has a reasonable programming base and wants to go straight into applied AI, not classic notebook ML |

The same track (e.g. Python) can appear in more than one path — what changes
is the **role** it plays (primary vs. stepping stone) and what comes after.
You can switch paths at any time with `choose path`; progress already made
in other tracks isn't lost, it just stops being a priority.

## The stack

| # | Track | Core | Key frameworks / tools | Role in the plan |
|---|---|---|---|---|
| 1 | TypeScript | TS/JS | advanced types, Zod | Base of the full-stack core |
| 2 | React + Next.js | TS | React 19, App Router, RSC, Server Actions, Tailwind | Frontend #1 + de facto meta-framework |
| 3 | Node backend | Node.js (TS) | Express/Fastify, NestJS, REST, auth | Backend runtime #1 |
| 4 | Python | Python | typing, pytest, FastAPI | #1 language in demand; bridge to AI |
| 5 | SQL & databases | SQL | PostgreSQL, indexes, modeling, ORMs | Most durable transversal skill |
| 6 | Machine Learning / AI | Python | NumPy, pandas, scikit-learn, PyTorch, Hugging Face, LangChain, RAG, vector DBs, MLOps | Highest future growth and salary premium |
| 7 | Fundamentals | — | Git, Docker, testing, CI/CD, systems design, algorithms | Transversal, always active |
| 8 | Java | Java | Spring Boot, JUnit | Maintenance — enterprise/finance |
| 9 | C# / .NET | C# | ASP.NET Core, EF Core, xUnit | Maintenance — Microsoft-stack enterprise |
| 10 | Ruby on Rails | Ruby | Rails, RSpec | Maintenance — startups/prototyping |

## Phases per path

Each path has a **Junior→Mid** phase (reach production without guidance) and
a **Mid→Senior** phase (design, ambiguity, technical leadership — see the
Mid→Senior Rubric in `CLAUDE.md`). Each path's active phase is tracked in
`progress/tracker.md`.

### Path 1 — Full-stack Web

#### 🟦 Junior→Mid (start here if the path was just chosen)
**Rough duration:** 8–10 weeks.

- 🔵 Primary: **TypeScript** → once you have a solid 🟨 in types/async, the
  primary rotates to **React + Next.js** (the TS base isn't dropped, it stays
  secondary).
- 🟢 Secondary: **Node backend**
- ⚪ Maintenance (rotating, 1/week each): SQL, Python, Fundamentals
  (Git/Docker from the start), Java, .NET, Rails

**Exit criterion:** TypeScript at a stable 🟨 + React/Next at 🟨 + Node at
🟥→🟨, and I can put together a mini full-stack (Next frontend + Node API)
end-to-end without guidance.

#### 🟦 Mid→Senior
**Rough duration:** 8–12 weeks, no fixed end — it's continuous improvement.

- 🔵 Primary: frontend/backend architecture design (RSC vs. client
  components, caching strategies, service boundaries, API contracts)
- 🟢 Secondary: performance at scale (Core Web Vitals, N+1, rate limiting,
  observability) and mentoring (reviewing a real teammate's code/design or
  other tracks' `solutions/`)
- ⚪ Maintenance: same as before, rotating

**Exit criterion (there's no real "exit," but to move to sustained
maintenance):** I can take an ambiguous business requirement, propose it as
a short RFC with discarded alternatives, implement it full-stack, and leave
it documented so someone else can operate it without asking me.

### Path 2 — Backend & Data

#### 🟩 Junior→Mid (start here if the path was just chosen)
**Rough duration:** 8–10 weeks.

- 🔵 Primary: **Python** (+ FastAPI)
- 🟢 Secondary: **SQL & databases**
- ⚪ Maintenance (rotating): TS/React/Node, Fundamentals (Docker/CI ramps up
  in intensity), Java, .NET, Rails

**Exit criterion:** Python at 🟨/🟩 + SQL at 🟨, I can build an API with real
persistence, tests, and Docker, without guidance.

#### 🟩 Mid→Senior
**Rough duration:** 8–12 weeks, continuous improvement.

- 🔵 Primary: data and service design (modeling for scale, zero-downtime
  migrations, partitioning/indexing, consistency vs. availability)
- 🟢 Secondary: operability (observability, SLOs, incident handling) and
  mentoring (reviewing others' schemas/PRs)
- ⚪ Maintenance: same as before, rotating

**Exit criterion:** I can design the data model and architecture of a new
service from an ambiguous requirement, document the tradeoffs, and anticipate
how it fails under load or with corrupted data.

### Path 3 — Applied AI

#### 🟪 Junior→Mid (start here if the path was just chosen)
**Rough duration:** 8–12 weeks.

- 🔵 Primary: **Machine Learning / AI** (focus on LLMs + RAG + MLOps, not
  just classic ML)
- 🟢 Secondary: **Fundamentals** (CI/CD, Docker, deployment — needed to
  serve models in production)
- ⚪ Maintenance (rotating): everything else, 1/week

**Exit criterion:** I can take a model/LLM from a notebook to an endpoint
served with FastAPI + Docker, with a basic evaluation of output quality.

#### 🟪 Mid→Senior
**Rough duration:** 8–12 weeks, continuous improvement.

- 🔵 Primary: AI systems design (choosing RAG vs. fine-tuning vs. prompting
  architecture, rigorous quality evaluation, cost/latency)
- 🟢 Secondary: MLOps at scale (model/data versioning, drift monitoring,
  safe rollback) and mentoring (reviewing others' pipelines/prompts)
- ⚪ Maintenance: same as before, rotating

**Exit criterion:** I can design and justify in writing the architecture of
an end-to-end AI system (data → model/prompt → evaluation → production),
including which alternatives I discarded and why.

## Ongoing (all paths, all phases)
Java, .NET, and Ruby on Rails stay alive with 1 exercise/week each in
rotation, to not lose the muscle, regardless of the chosen path. If your work
goal is **enterprise** (banking, insurance, government), bump **Java or
.NET** to secondary. If it's **product/startup**, bump **Rails** instead.

## How to use this file with Claude Code
- Before generating an exercise without an explicit track, Claude must read
  the chosen path and its ACTIVE phase in `progress/tracker.md`, and respect
  that phase's 🔵/🟢/⚪ distribution.
- When you use `choose path`, Claude writes the chosen path in
  `progress/tracker.md` and applies its Junior→Mid phase distribution
  (unless `assess level` already confirmed a Mid level or higher, in which
  case it starts directly at Mid→Senior).
- When you use `next phase`, Claude checks the exit criterion of the active
  phase WITHIN the chosen path against `progress/tracker.md` and, if it's
  met, marks that path's next phase as ACTIVE (edits this file).
