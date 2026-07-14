# Tracker

**Chosen path:** Path 1 — Full-stack Web
**Active phase:** 🟦 Junior→Mid (Path 1)
**Current streak:** 9 days
**Current exercise:** — (none in progress; run `exercise` for the next one).
**Last reviewed:** TypeScript 0010 transiciones-pago-webhooks — 🟩 (2026-07-14, strong discriminated-unions/type-guards submission: `EstadoPago`/`EventoGateway` correctly model each state/event with only its own fields, `parsearEventoGateway` independently verified to reject 12 garbage payloads without throwing (confirmed via `tsc --strict` + `vitest run`, 29/29 green), the refund-accumulation invariant from the incident is correctly enforced, and the throw-vs-Result decision plus the idempotency asymmetry are both genuinely reasoned in writing, not decorative; real gap found: the "duplicate capture is a no-op" shortcut checks only `estado.status === 'capturado'`, never that `evento.monto` matches what was already captured — verified a second `captura_exitosa` with a *different* amount is silently swallowed instead of rejected, same bug species as this track's recurring "only one of two things that should be validated together actually is" — see `log.md` for the fix).

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
