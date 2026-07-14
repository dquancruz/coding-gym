# Tracker

**Chosen path:** Path 1 — Full-stack Web
**Active phase:** 🟦 Junior→Mid (Path 1)
**Current streak:** 8 days
**Current exercise:** — (none in progress; run `exercise` for the next one).
**Last reviewed:** TypeScript 0009 bus-eventos-tipado — 🟩 (2026-07-13, strong generics/utility-types submission: `EventMap`-driven inference across `on`/`off`/`emit` verified to actually reject mismatched handlers at compile time, `PayloadDe<H>` conditional+`infer` type genuinely used (not decorative) and confirmed to resolve to the real payload shape, both left-open behaviors (throwing handler, double-unsubscribe) decided and covered by dedicated tests; real gap found: `onOnce` stores a wrapper instead of the caller's handler reference, so `off(evento, handlerPassedToOnOnce)` silently no-ops instead of unsubscribing — see `log.md` for the fix).

## This phase's distribution
- 🔵 Primary: TypeScript (rotates to React/Next once TS reaches a stable 🟨)
- 🟢 Secondary: Node backend
- ⚪ Maintenance (rotating 1/week): SQL, Python, Fundamentals, Java, .NET, Ruby on Rails

## Levels per skill

| Track | Skill | Level | Last practice | Exercises at target level |
|---|---|---|---|---|
| TypeScript | basic types (interfaces, unions) | 🟥 | 2026-07-12 (0008 tarifas-alquiler-vehiculos, 🟩 — see `log.md`) | 2/3 at 🟩 (0001 🟥, 0002 🟨, 0003 🟩, 0004 🟨, 0004-fix 🟨, 0004-fix-corrected 🟩, 0008 🟩 — need 1 more consecutive 🟩 to qualify for `level up`) |
| TypeScript | generics and utility types | 🟥 | 2026-07-13 (0009 bus-eventos-tipado, 🟩 — see `log.md`) | 2/3 at 🟩 (0005 🟨, 0005-fix 🟩, 0009 🟩 — need 1 more consecutive 🟩 to qualify for `level up`) |
| TypeScript | discriminated unions / type guards | 🟥 | 2026-07-07 (0006 estado-pedido-en-vivo, 🟩 — see `log.md`) | 1/3 at 🟩 (0006 🟩 — need 2 more consecutive 🟩 to qualify for `level up`) |
| TypeScript | runtime validation (Zod) | 🟥 | 2026-07-08 (0007 validacion-pedido-entrante, 🟩 — see `log.md`) | 1/3 at 🟩 (0007 🟩 — need 2 more consecutive 🟩 to qualify for `level up`) |
| React/Next | components + basic hooks | 🟥 | — | 0/3 |
| React/Next | App Router (server/client components) | 🟥 | — | 0/3 |
| React/Next | data fetching + Server Actions | 🟥 | — | 0/3 |
| Node | basic REST + layered structure | 🟥 | 2026-07-09 (0001 api-tareas-soporte fix, 🟩 — see `log.md`) | 1/3 at 🟩 (0001 🟩, 0001-fix 🟩 — need 2 more consecutive 🟩 on a NEW exercise to qualify for `level up`) |
| Node | auth (JWT) | 🟥 | — | 0/3 |
| Node | centralized error handling | 🟥 | — | 0/3 |
| SQL | SELECT/JOIN/aggregations | 🟥 | — | 0/3 |
| Python | syntax + basic typing | 🟥 | — | 0/3 |
| Fundamentals | Git (branches, rebase) | 🟥 | 2026-07-10 (0001 rebase-sin-panico, 🟩 — see `log.md`) | 1/3 at 🟩 (0001 🟩 — need 2 more consecutive 🟩 to qualify for `level up`) |
| Fundamentals | basic Docker | 🟥 | — | 0/3 |
| Java | syntax + collections | 🟥 | — | 0/3 |
| .NET | syntax + basic LINQ | 🟥 | — | 0/3 |
| Ruby/Rails | syntax + basic ActiveRecord | 🟥 | — | 0/3 |

> Claude Code: update this table after every `review`. Add new skill rows as
> they become needed (follow the checklist in each track's `README.md`).
> Level can go up to 🟦 (Senior) — see the Mid→Senior Rubric in `CLAUDE.md`.
> If `assess level` confirmed an entry level without starting from 0/3,
> note it in the corresponding column (e.g. "confirmed by assessment,
> 2026-07-03" instead of "0/3").
