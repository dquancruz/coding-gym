# Tracker

**Chosen path:** Path 1 — Full-stack Web
**Active phase:** 🟦 Junior→Mid (Path 1)
**Current streak:** 9 days
**Current exercise:** [Node] 0002 reservas-stock (`03-node-backend/exercises/0002-reservas-stock/`) — assigned 2026-07-15, target 🟩, no hints. Reviewed 2026-07-16 as 🟨, then fixed same day (by Claude Code, not the learner — see note below) and now 🟩/complete/merged via PR.
**Last reviewed:** Node 0002 reservas-stock — 🟨→🟩 (2026-07-16). Original submission: excellent layered architecture (routes→controller→service→repository strictly one-directional), `stockDisponible` genuinely computed not stored, idempotent-cancel and the 409-vs-400-vs-422 write-up both well reasoned, `tsc --noEmit` clean under a strict config, 22/22 tests passing — but the central error handler defaulted every non-`AppError` to 500, reintroducing the exact bug already flagged and fixed on 0001 (verified: malformed-JSON body returned 500 even though `body-parser`'s own error already carries `statusCode: 400`), plus a secondary non-blocking gap where `ReservasService`/`ReservasRepository` returned live internal object references instead of defensive copies. **Both fixed same day by Claude Code at the user's request** (not a learner resubmission) — 25/25 tests passing after the fix. See `log.md` for the full diff and the bookkeeping note: this fix does NOT count toward the learner's own `centralized error handling` promotion streak, since the learner didn't write it.

## This phase's distribution
- 🔵 Primary: TypeScript (rotates to React/Next once TS reaches a stable 🟨)
- 🟢 Secondary: Node backend
- ⚪ Maintenance (rotating 1/week): SQL, Python, Fundamentals, Java, .NET, Ruby on Rails

## Levels per skill

| Track | Skill | Level | Last practice | Exercises at target level |
|---|---|---|---|---|
| TypeScript | basic types (interfaces, unions) | 🟥 | 2026-07-12 (0008 tarifas-alquiler-vehiculos, 🟩 — see `log.md`) | 2/3 at 🟩 (0001 🟥, 0002 🟨, 0003 🟩, 0004 🟨, 0004-fix 🟨, 0004-fix-corrected 🟩, 0008 🟩 — need 1 more consecutive 🟩 to qualify for `level up`) |
| TypeScript | generics and utility types | 🟥 | 2026-07-13 (0009 bus-eventos-tipado, 🟩 — see `log.md`) | 2/3 at 🟩 (0005 🟨, 0005-fix 🟩, 0009 🟩 — need 1 more consecutive 🟩 to qualify for `level up`) |
| TypeScript | discriminated unions / type guards | 🟥 | 2026-07-14 (0010 transiciones-pago-webhooks, 🟩 — see `log.md`) | 2/3 at 🟩 (0006 🟩, 0010 🟩 — need 1 more consecutive 🟩 to qualify for `level up`) |
| TypeScript | runtime validation (Zod) | 🟥 | 2026-07-08 (0007 validacion-pedido-entrante, 🟩 — see `log.md`) | 1/3 at 🟩 (0007 🟩 — need 2 more consecutive 🟩 to qualify for `level up`) |
| React/Next | components + basic hooks | 🟥 | — | 0/3 |
| React/Next | App Router (server/client components) | 🟥 | — | 0/3 |
| React/Next | data fetching + Server Actions | 🟥 | — | 0/3 |
| Node | basic REST + layered structure | 🟥 | 2026-07-16 (0002 reservas-stock, layering/business-logic dimensions all 🟩-quality, but overall exercise verdict 🟨 — see `log.md`) | 1/3 at 🟩 (0001 🟩, 0001-fix 🟩 — need 2 more consecutive 🟩 on a NEW exercise; 0002 doesn't count toward this since its overall verdict is 🟨) |
| Node | auth (JWT) | 🟥 | — | 0/3 |
| Node | centralized error handling | 🟥 | 2026-07-16 (0002 reservas-stock — hierarchy/design solid, but implementation regressed the malformed-body→500 bug already fixed on 0001; Claude Code applied the fix same day at the user's request, not the learner — see `log.md`) | 0/3 (still no learner-authored 🟩 on this skill; the code is now correct, but that was Claude's fix, not a demonstration by the learner — assign a fresh exercise targeting this) |
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
