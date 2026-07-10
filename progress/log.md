# Log

> Entry format (Claude Code adds one after every `review`):
>
> ## YYYY-MM-DD — [Track] NNNN Title — verdict (🟥/🟨/🟩)
> **Score:** Correctness X · Readability X · Idiomatic X · Tests X · Errors X · Design X · Performance X · Explanation X
> **Learned:** ...
> **To improve:** ...
> **Suggested next refactor:** ...

---

## 2026-07-10 — [Fundamentals] 0001 rebase-sin-panico — verdict (🟩)
**Score:** Correctness 4 · Readability 3 · Idiomatic 4 · Tests 3 · Errors/Recovery 4 · Design 4 · Performance 3 · Explanation 3
**Learned:** First Git rebase/conflict exercise, exceeded the 🟥 target on first exposure — same pattern as every first-exposure exercise in this repo so far. The reflog tells the real story: first attempt rebased with both commits picked, resolved the conflict once, ended up with 2 commits instead of the required 1; recognized that and ran a *second* interactive rebase to fixup the `wip` commit in, with no `reset --hard` and no restarting from scratch — genuine forward-correction-without-panic, which is the actual skill this exercise targets, not just "can you type `git rebase`." Conflict resolution correctly combined both legitimate changes (cafe's price bump from `main` + the rename from `feature`) instead of picking a side — verified independently against `precios.txt`'s final content and `tests/verificar.sh` (all 5 checks green). `decision.md` correctly reasons through both asked questions: why rebase over merge (clean history, no merge commit + wip noise) and how the conflict was resolved (combine, don't choose a side).
**To improve:** The final squashed commit message (`feat: renombrar cafe a 'cafe negro' y agregar te al catalogo`) describes the *original* pre-conflict commit's intent, not what the commit actually contains after the squash + conflict resolution — it also now changes the cafe price and fixes the te price, neither mentioned. This is the exact failure mode atomic-commit discipline is supposed to prevent: the message has to track the diff, not the commit's original pre-squash purpose. Separately, `decision.md` has the right reasoning but needs a proofread pass (missing tildes, "si se hacer marge" instead of "si se hace merge") — the README explicitly asked for notes legible to someone reading them in 6 months, same bar as commit messages. Minor/unscored: a no-op `git commit --amend` appears in the reflog right after the fixup (identical tree and message before/after) — not wrong, just worth being able to explain why.
**Suggested next refactor:**
```
# Before
feat: renombrar cafe a 'cafe negro' y agregar te al catalogo

# After — names everything the diff actually touches
feat: renombrar cafe a 'cafe negro', agregar te y actualizar precio del cafe
```
**Next skill to rotate in:** first 🟩 on Fundamentals' Git skill (1/3 toward `level up`). All other maintenance tracks (SQL, Python, Docker, Java, .NET, Rails) are still at 0/3, never practiced — still the biggest gap in the rotation.

---

## 2026-07-09 — [Node] 0001 api-tareas-soporte — verdict (🟩)
**Score:** Correctness 3 · Readability 4 · Idiomatic 4 · Tests 3 · Errors 3 · Design 4 · Performance 3 · Explanation 4
**Learned:** First Node/Express exercise and the layering is genuinely clean, not file-split theater: `repository` only knows `Tarea[]` and generates its own id via a counter (not `array.length`, so ids survive deletions), `service` only moves domain objects, `controller` is the only file that imports `Request`/`Response`, `routes` has zero logic. `app.ts`/`server.ts` are correctly split so `supertest` can hit `app` without binding a port. Directly reused the `safeParse` pattern from the TypeScript/Zod track at a real system boundary (HTTP body) instead of just at a function argument — good transfer. All 7 required test scenarios from the README are present and pass (verified via `vitest run`), with `beforeEach(limpiar)` correctly resetting in-memory state between tests. `tsc --strict --noImplicitAny` compiles clean.
**To improve:** The error middleware (`src/app.ts:20-23`) always responds `500`, regardless of the error's actual origin. Verified by running the server and sending it malformed JSON directly: `body-parser` (used internally by `express.json()`) attaches `statusCode: 400` to that exact error — it already knows it's the client's fault — but the middleware ignores that and reports every error as a server failure. In production this pollutes 5xx dashboards/alerts with client-caused errors. It's also unverified by the test suite: none of the 7 tests exercise the error-middleware path at all, so this shipped untested — same "did you actually run the failure path" gap that's shown up before in this track's TS exercises, just moved to HTTP-level errors instead of type errors. Minor/non-blocking: `GET /tareas/abc` (`Number("abc")` → `NaN`) silently resolves to `404` instead of `400` — defensible, but looks accidental without a comment.
**Suggested next refactor:**
```ts
// Before — every error becomes 500, even ones that already know their status
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor" });
});

// After — trust the status the error already carries; default to 500 only for unknowns
function tieneStatusCode(err: unknown): err is { statusCode: number } {
  return typeof err === "object" && err !== null &&
    "statusCode" in err && typeof (err as { statusCode: unknown }).statusCode === "number";
}
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const statusCode = tieneStatusCode(err) ? err.statusCode : 500;
  const mensaje = statusCode < 500 ? "Solicitud inválida" : "Error interno del servidor";
  return res.status(statusCode).json({ error: mensaje });
});
```
Add the regression test that would've caught it: POST a raw malformed-JSON body (`.set('Content-Type', 'application/json').send('{titulo: bad')`, not `.send(obj)`) and assert `400`, not `500`.
**Next skill to rotate in:** first 🟩 on Node's "basic REST + layered structure" (1/3 toward `level up` for that skill). Node was chosen this round over TypeScript specifically because it's the phase's secondary track and had never been touched (0/3) while TS had 7 exercises in a row — that imbalance is now closed for this week.

## 2026-07-09 — [Node] 0001 api-tareas-soporte (fix) — verdict (🟩)
**Score:** Correctness 4 · Readability 4 · Idiomatic 4 · Tests 3 · Errors 4 · Design 4 · Performance 3 · Explanation 4
**Learned:** Applied the exact suggested fix (`tieneStatusCode` type guard reading `err.statusCode`, defaulting to 500 only for genuinely unknown errors) unprompted, no second hint needed. Verified independently on a live server: malformed JSON now returns `400 {"error":"Solicitud inválida"}` instead of `500` — confirmed the fix addresses the real bug, not just a plausible-looking diff. Sanity-checked the adjacent paths didn't regress: normal Zod validation still 400s correctly, normal creation still 201s correctly. `tsc --strict` compiles clean, all 7 original tests still pass.
**To improve:** Didn't add the regression test I asked for (malformed-JSON body → assert 400) — the fix is correct but still unverified by the suite itself, so nothing stops this from silently regressing later. Also didn't touch the minor NaN-id note (`GET /tareas/abc` → 404 by accident, not by design) — acceptable since I flagged that one as non-blocking.
**Suggested next refactor:** Add the missing regression test:
```ts
it("responde 400 (no 500) si el JSON del body está mal formado", async () => {
  const respuesta = await request(app)
    .post("/tareas")
    .set("Content-Type", "application/json")
    .send("{titulo: bad json");

  expect(respuesta.status).toBe(400);
});
```
That's the actual bar for "done" on an error-handling fix: not just that it works when I poke it manually, but that the suite pins it down so it can't come back unnoticed.
**Note on process:** my first verification pass after this fix falsely read as "still broken" (500) — turned out to be a stale server process from the previous review still bound to port 3000, answering with the old code. Killed it and retested clean. Worth knowing for your own workflow too: if `npm run dev` / manual curl checks ever give a surprising result after a fix, check `netstat`/task manager for a leftover process on the port before trusting the result.

## 2026-07-09 — [Node] 0001 api-tareas-soporte (regression test added) — verdict (🟩)
**Score:** Correctness 4 · Readability 4 · Idiomatic 4 · Tests 4 · Errors 4 · Design 4 · Performance 3 · Explanation 4
**Learned:** Added exactly the regression test asked for — malformed JSON body asserts `400`, not `500`. Verified independently: `tsc --strict` compiles clean, all 8 tests pass via `vitest run` (up from 7), and confirmed on a live server (after clearing a stray process left on port 3000 from my own earlier manual testing, unrelated to the student's work) that the behavior matches what the test now pins down. This closes the "Tests" gap from the previous two reviews — the error-handling fix is now guarded against silent regression, not just manually spot-checked. Exercise is functionally complete against all README acceptance criteria.
**To improve (non-blocking):** Indentation on the new test (lines 34–39) is 2 spaces instead of the file's established 4 — cosmetic only, doesn't affect correctness. Separately, a structural note surfaced while preparing this for a PR: the repo's established convention (see 0007's commit) is a single shared root `package.json`/lockfile for all exercises; this Node exercise instead has its own local `package.json` + `pnpm-lock.yaml` (reasonable — a runnable Express server needs its own scripts/port, unlike a plain TS file), but `express`/`supertest`/their `@types` also ended up added to the *root* `package.json`/`package-lock.json`, which nothing at root actually needs. Flagged separately for a decision before opening the PR.
**Suggested next refactor:** None needed for the exercise itself — this is done. Fix the indentation on the new test whenever convenient.

---

## 2026-07-08 — [TypeScript] 0007 validacion-pedido-entrante — verdict (🟩)
**Score:** Correctness 4 · Readability 4 · Idiomatic 4 · Tests 4 · Errors 4 · Design 4 · Performance 3 · Explanation 4
**Learned:** First exposure to Zod and already using it like someone who's shipped it before: `z.infer` to derive `Pedido` instead of a hand-written duplicate interface, `.safeParse()` (never `.parse()`) so `procesarPedido` truly never throws, `z.enum` instead of a loose string, and — unprompted, since the hint only mentioned `z.string().email()` — the newer Zod v4 top-level `z.email()`. The discriminated-union result type (`{ok:true,...} | {ok:false,...}`) is a direct callback to 0006; you're already reaching for that pattern by default instead of a boolean flag. All 5 tests pass (`vitest run`), and the file type-checks clean under `tsc --strict`. Tests cover happy path, invalid email, empty `items`, negative `cantidad`, and a "never throws" sweep over `null`/string/number/`undefined` garbage. The stretch goal note (why `total` vs. item sum can't be validated without `precioUnitario`, plus the exact `.refine()` you'd write if it existed) is genuinely a discarded-alternative writeup — that's Mid→Senior-flavored communication, not just Junior→Mid correctness.
**To improve:** Nothing broke, but one design decision is silent: `z.object({...})` strips unknown keys by default. Coming from a legacy system, that's a real fork — do you want to tolerate fields you don't know about yet (current behavior), or reject anything unexpected as a signal the legacy system's contract changed underneath you? Right now that choice was made by omission, not on purpose.
**Suggested next refactor:**
```ts
// before — permissive by default, undocumented
export const pedidoSchema = z.object({
  id: z.string().min(1, "no puede estar vacío"),
  // ...
});
```
```ts
// after — same permissive behavior, but now it's a stated decision
// Deliberately permissive: el sistema legacy puede agregar campos nuevos
// antes de que actualicemos este schema; los ignoramos en vez de romper
// el pipeline. Si en algún momento un campo desconocido debe ser señal de
// alerta (ej. drift de contrato), cambiar a `.strict()` acá.
export const pedidoSchema = z.object({
  id: z.string().min(1, "no puede estar vacío"),
  // ...
});
```
Same code, but now the choice is legible to the next person (or you, in six
months) instead of being an implicit Zod default. Also worth one more test:
a payload where `cantidad` arrives as the string `"2"` instead of the number
`2` — confirms you're relying on Zod's lack of coercion on purpose, not by
luck.
**Next skill to rotate in:** you're now 1/3 toward `level up` on Zod — two
more consecutive 🟩 there. TypeScript overall still needs 2 more 🟩 on basic
types and 2 more on generics before any of those qualify either.

## 2026-07-01 — [TypeScript] 0001 catalogo-carrito — verdict (🟥)
**Score:** Correctness 1 · Readability 2 · Idiomatic 2 · Tests 1 · Errors 2 · Design 1 · Performance 3 · Explanation 1
**Learned:** `interface Product` well typed, correct literal union on `estado`, zero `any` (verified with `tsc --strict`). `applyDiscount` and `calculateTotal` are correctly solved with immutable spread/reduce.
**To improve:** `CartItem` is not the requested intersection (`Product & { cantidad: number }`) — it ended up as a nested interface (`{ product, quantity }`), which sidesteps exactly the exercise's point of composing types with `&`. `addToCart` matches neither the requested signature (`cart: CartItem[], product, cantidad`) nor the requested behavior (add up the quantity if it already exists, return a new array): it takes a single `CartItem` instead of an array, and returns `CartItem | String` — the capitalized `String` is the wrapper object, not the `string` primitive.
**Suggested next refactor:** Rewrite `CartItem` as `type CartItem = Product & { cantidad: number }` and reimplement `addToCart` using `.find()`/`.map()` over the array to add up quantities or add the item, always returning a new array.

## 2026-07-01 — [TypeScript] 0001 catalogo-carrito (fix) — verdict (🟥, solved with guidance)
**Score:** Correctness 3 · Readability 3 · Idiomatic 3 · Tests 1 · Errors 2 · Design 3 · Performance 3 · Explanation 1
**Learned:** Correctly applied `CartItem = Product & { quantity: number }` and rewrote `addToCart` with the requested signature and behavior (`.some()` + `.map()`/spread, no mutation, adds up the quantity if it already exists). Compiles clean under `strict`, no `any`.
**To improve:** The fix followed almost word-for-word the fix I gave in the previous review — it wasn't solved from scratch without hints, so it doesn't count as a demonstration of 🟨 level. Still uses English field names (`name`/`price`/`state`) instead of the ones requested in the prompt (`nombre`/`precio`/`estado`).
**Suggested next refactor:** For this to count toward promotion, solve the next intersections/function-signatures exercise without me giving the fix code — just point out the error and let it be modeled independently.

## 2026-07-02 — [TypeScript] 0002 reservas-gimnasio — verdict (🟥)
**Score:** Correctness 2 · Readability 3 · Idiomatic 3 · Tests 2 · Errors 3 · Design 3 · Performance 3 · Explanation 2
**Learned:** `ClassSession`/`Booking` well modeled (interface + `&` intersection without manually repeating fields), correct literal union on `estado`. Compiles clean under `strict`, zero `any` (verified with `tsc --strict --noImplicitAny`). `totalAttendees` and `cancelSession` are correct and immutable (`Readonly<ClassSession>` in the signature, verified with a test confirming the original object isn't mutated). `personas <= 0` validation with an explicit `Error`, stretch goal met.
**To improve:** `bookSession` has a correctness bug in the core acceptance criterion: the `.some()`/`.map()` that decides whether "a booking already exists" only compares `item.id === session.id`, ignoring `cliente`. Effect verified by running the code: if Carlos books 2 people into yoga-101 and then Ana books 3 people into the same session, Carlos's booking is **silently lost** (only Ana's remains) instead of the two coexisting as separate bookings. Also, even when it is the same client rebooking, the code *replaces* `personas` instead of adding to it (`personas: personas` instead of `item.personas + personas`), literally violating the prompt ("add people to that booking"). The `tests/manual.ts` file caught none of this because it never calls `bookSession` twice on the same session — the 3 test cases cover simple creation, a validation error, and functions that don't even go through `bookSession`. It's the same kind of gap as in 0001: the "does it already exist?" logic needs the full composite key, not just one field.
**Suggested next refactor:**
```ts
// Before — only compares session.id, loses other clients' bookings and doesn't add up
const existe = bookings.some(item => item.id === session.id);
if (!existe) {
    return [...bookings, { ...session, cliente, personas }];
} else {
    return bookings.map(item =>
        item.id === session.id
            ? { ...item, cliente: cliente, personas: personas }
            : item
    );
}

// After — the key is (session.id, cliente); adds up instead of replacing
const existente = bookings.find(
    item => item.id === session.id && item.cliente === cliente
);
if (!existente) {
    return [...bookings, { ...session, cliente, personas }];
}
return bookings.map(item =>
    item === existente
        ? { ...item, personas: item.personas + personas }
        : item
);
```
After applying the fix, add to `tests/manual.ts` the two cases that would have caught it: (a) the same client books the same session twice → `personas` must add up; (b) two different clients book the same session → there must be two separate `Booking`s left, not one overwritten.

## 2026-07-02 — [TypeScript] 0002 reservas-gimnasio (fix 1) — verdict (🟥, partial fix)
**Score:** Correctness 2 · Readability 3 · Idiomatic 3 · Tests 3 · Errors 3 · Design 3 · Performance 3 · Explanation 2
**Learned:** Added exactly the two suggested test cases (same-client accumulation, separate-client isolation) and both pass — a good sign it understood the acceptance criterion. Fixed the `.find()` on line 21 to use the composite key `id + cliente`.
**To improve:** The fix was only half done: it fixed the `find` that *decides whether it exists*, but not the `.map()` that *performs the update* — that one still only compares `item.id === session.id`. I verified this by running a third scenario that neither the exercise nor the previous fix covered: two clients already with separate bookings on the same session (Carlos=2, Ana=3), and one of them (Carlos) books 4 more. Actual result: the `.map()` matches BOTH rows because they share the same `session.id`, so Ana's row gets overwritten with `cliente: 'Carlos'` (from the fixed `cliente: cliente` in the spread) and `personas: 7`, and a new row is also created for Carlos with `personas: 6` — a total of 13 instead of 9, and Ana's booking ends up corrupted. Pattern: once you already have the exact reference to the found element (`existe`), compare it by identity (`item === existe`) instead of repeating a partial condition inside the `map`.
**Suggested next refactor:**
```ts
// Before
return bookings.map(item =>
    item.id === session.id
        ? { ...item, cliente: cliente, personas: item.personas + personas }
        : item
);

// After — same key as `existe`, compared by identity
return bookings.map(item =>
    item === existe
        ? { ...item, personas: item.personas + personas }
        : item
);
```
Add a third case to `manual.ts`: two clients with separate bookings on the same session, one of them rebooks — verify the other client's row isn't touched.

## 2026-07-02 — [TypeScript] 0002 reservas-gimnasio (fix 2) — verdict (🟨)
**Score:** Correctness 4 · Readability 3 · Idiomatic 4 · Tests 3 · Errors 3 · Design 3 · Performance 3 · Explanation 2
**Learned:** `item === existe` fixed the bug at its root — I verified this by running the scenario that broke the previous fix (Carlos=2, Ana=3, Carlos books 4 more): it gives Carlos=6, Ana=3, two rows, no corruption. Compiles clean under `strict --noImplicitAny`, zero `any`. `totalAttendees`/`cancelSession` are still correct and immutable. Good reaction to feedback: understood why comparing by identity fixes both the "wrong client" bug and the "replaces instead of adds up" bug with a single change.
**To improve:** Didn't add the suggested third test case (two separate clients + one rebooks) — exactly the one that would have caught the previous fix's bug; the suite is left unguarded against a regression there. `cliente: cliente` in the spread on line 28 is now redundant (dead weight, not a bug) after the switch to `item === existe`. The comments (`// 1. We apply Readonly...`, `// We fix the .reduce...`) document the fixing process instead of the design reasoning — for mid I need to see the *why* behind decisions (e.g. why compare by identity, why throw an error on `personas <= 0` instead of silently ignoring it), not a patch history.
**Suggested next refactor:** Remove the redundant `cliente: cliente` on line 28. Add the third test (separate clients + rebooking) to `manual.ts`. Next time you fix something, replace the changelog-style comment with a line explaining the design decision, not the change that was made.

## 2026-07-04 — [TypeScript] 0003 cola-soporte — verdict (🟩)
**Score:** Correctness 3 · Readability 4 · Idiomatic 4 · Tests 4 · Errors 3 · Design 3 · Performance 4 · Explanation 3
**Learned:** First clean first-attempt solution in this track — compiles under `strict --noImplicitAny` with zero `any` (verified via `tsc`), all 7 manual tests pass (verified by running compiled output). `Asignacion = Ticket & {...}` correctly composes via intersection instead of repeating fields. No mutation anywhere, `Readonly<T>` used consistently. `calcularCargaDeTrabajo` uses a `Map` for O(n) grouping. The comment block justifying `throw` (blocking, business-invalid) vs. `console.warn` (valid-but-noteworthy reassignment) is genuine design reasoning — this closes the exact gap (`Explanation=2`) that blocked 🟩 on 0002.
**To improve:** Two related issues, one causing the other. (1) `resolver` validates "has this ticket ID ever appeared in the assignment log" (`asignaciones.some(...)`) instead of "is `ticket.estado` currently `'asignado'`" — since the log is append-only, this passes forever once a ticket has been assigned even once, regardless of current state. Not triggered by the current API surface (no `reabrir` implemented), but it's exactly the state-drift bug the exercise's premise describes. (2) Root cause: `asignar` returns only the updated `Asignacion[]`, never the updated `Ticket` — proven by the test file itself (line 24), which hand-rolls `{ ...ticketAbierto, estado: 'asignado' }` because the module never hands that back. The module owns half the state machine and pushes the other half onto every caller.
**Suggested next refactor:**
```ts
// Before (soporte.ts:93-96) — checks history, not current state
const tieneAsignacion = asignaciones.some(item => item.id === ticket.id);
if (!tieneAsignacion) {
    throw new Error(`El ticket #${ticket.id} nunca fue asignado, no puede resolverse`);
}

// After — trust the authoritative field
if (ticket.estado !== 'asignado') {
    throw new Error(`El ticket #${ticket.id} no puede resolverse: no está asignado`);
}
```
Make `asignar` return the updated `Ticket` alongside the updated log (not just the log) so callers never need to hand-roll a state transition. Add a test with a manually-constructed `estado: 'abierto'` ticket that still has a stale `Asignacion` entry — `resolver` should reject it and currently wouldn't.

## 2026-07-05 — [TypeScript] 0004 solicitudes-vacaciones — verdict (🟨)
**Score:** Correctness 3 · Readability 4 · Idiomatic 4 · Tests 3 · Errors 3 · Design 3 · Performance 4 · Explanation 3
**Learned:** Went for the discriminated-union stretch goal unprompted (`SolicitudPendiente | SolicitudAprobada | SolicitudRechazada | SolicitudCancelada`) — a `'rechazada'` without `motivo` is now structurally unrepresentable. `diasDisponibles` correctly derives from current `'aprobada'` state only, directly applying 0003's feedback. `cancelar` deliberately rebuilds the object field-by-field instead of spreading, specifically to avoid leaking `revisadaPor`/`revisadaEn` onto a cancelled request — a real design catch. Compiles clean under `strict --noImplicitAny`, zero `any` (verified via `tsc`), all 7 given tests pass (verified by running compiled output). `Resultado<T>` vs. exception justification is genuine reasoning, not decoration.
**To improve:** `aprobar(solicitud, empleado, solicitudes, ...)` never checks that `solicitud.empleadoId === empleado.id` — the two are passed as independent parameters with no cross-validation. Confirmed by running: `aprobar(solicitudDeAna(10 días, saldo real 5), empleadoEquivocado(saldoAnual: 100), [solicitudDeAna])` returns `{ ok: true }` — Ana's request gets approved against a stranger's balance because `diasDisponibles` filters by `empleado.id` (the wrong one) instead of `solicitud.empleadoId`. This is the third occurrence of the same bug species in this track (0001: `addToCart` checked only `id` not `id+cliente`; 0002: `.map()` matched only `session.id`, corrupting another client's booking) — two related identities passed around, only one (or now, none) validated. General rule to internalize: when a function takes two objects meant to reference each other, validate that relationship first, before any business logic.
**Suggested next refactor:**
```ts
// Before (aprobar, first line of body)
if (solicitud.estado !== 'pendiente') { ... }

// After — validate the relationship before anything else
if (solicitud.empleadoId !== empleado.id) {
    return fallo(`La solicitud #${solicitud.id} pertenece al empleado ${solicitud.empleadoId}, no a ${empleado.id}`);
}
if (solicitud.estado !== 'pendiente') { ... }
```
Add the test that would've caught it: `aprobar` with a mismatched `solicitud`/`empleado` pair must fail explicitly. Secondary, unscored gap: no constructor/factory validates a `Solicitud` at creation (`cantidadDias` could be negative or inconsistent with the date range) — not required by this exercise, but the natural next boundary to close.

## 2026-07-06 — [TypeScript] 0004 solicitudes-vacaciones (fix) — verdict (🟨, import broken as first committed)
**Score:** Correctness 3 · Readability 4 · Idiomatic 4 · Tests 2 · Errors 4 · Design 4 · Performance 4 · Explanation 3
**Learned:** Applied the `empleadoId`/`empleado.id` cross-check unprompted, without me handing over the fix code, and placed it *before* the `estado` check — internalizing last review's general rule (validate the relationship between two referenced objects before any business logic) for the first time without a second hint. Verified by running the compiled test standalone: approving Ana's request against a stranger now fails with a message naming whose request it actually is, and the request stays `pendiente`.
**To improve:** `tests/solicitudes-vacaciones.test.ts:9` imports from `'../src/vacaciones'`, but the file is `src/solicitudes-vacaciones.ts` — the test suite doesn't compile as committed (`TS2307: Cannot find module`). None of the 8 tests, including the new one covering the fix, ever executed. I only confirmed the fix works by correcting the import in a scratch copy and running it manually. Shipping a test that asserts the right thing but can't resolve its own import is a process gap, not a types gap — the exercise isn't done until you've actually run `tsc` + `node` on it, not just read the diff.
**Suggested next refactor:** Fix the import path, then make "compile and run before calling it done" non-negotiable — especially on a diff whose entire purpose is proving a previously-flagged bug is fixed.

## 2026-07-06 — [TypeScript] 0004 solicitudes-vacaciones (fix, corrected) — verdict (🟩)
**Score:** Correctness 4 · Readability 4 · Idiomatic 4 · Tests 4 · Errors 4 · Design 4 · Performance 4 · Explanation 3
**Learned:** Import path corrected to `../src/solicitudes-vacaciones`. Re-verified independently: `tsc --strict --noImplicitAny` compiles clean and all 8 assertions (including the new empleado/solicitud cross-check case) run and pass via `node`. The underlying fix from the previous entry holds — this closes out the empleado/solicitud cross-validation gap from 0004's original review. First 🟩 since 0003; streak toward `level up` resets counting from here (1/3).
**To improve:** Nothing blocking. Minor: `Explanation` stays at 3 — no note in the diff about *why* the import broke in the first place (copy-paste from a renamed file?), which would've been useful context for next time.
**Suggested next refactor:** None needed for this exercise. Carry the "compile + run before done" habit forward — don't let it be specific to this one incident.

## 2026-07-06 — [TypeScript] 0005 perfiles-repositorio — verdict (🟨)
**Score:** Correctness 3 · Readability 4 · Idiomatic 4 · Tests 1 · Errors 4 · Design 4 · Performance 4 · Explanation 4
**Learned:** First real use of the generics/utility-types skill and it's genuinely strong: `Repositorio<T extends { id: number }>` is correctly constrained and generic, `PerfilPublico`/`PerfilResumen` are properly *derived* via `Omit`/`Pick` instead of retyped by hand, `Record<number, Perfil>` used correctly for the index, `Partial<T>` used correctly in `actualizar` (and `id` is deliberately re-pinned after the spread so a careless `cambios` can't hijack the item's key — a real catch). The comments justify every non-obvious decision (Result-via-`undefined`/`boolean` vs. exceptions, duplicate-id "last wins", closures vs. class) — the best "Explanation" score of the track so far. I verified all of `guardar`/`obtener`/`actualizar`/`eliminar`/`indexarPorId`/`aVistaPublica`/`aResumenes` behave correctly by writing and running a standalone test script myself, since none existed.
**To improve:** `tests/perfiles.test.ts` is empty — zero tests, despite the README explicitly requiring coverage of CRUD happy path, partial update, missing-id behavior, `aVistaPublica` excluding `passwordHash`, and duplicate-id indexing. This is the second consecutive exercise where "did you actually run it" broke down (0004-fix: tests existed but didn't compile; 0005: no tests at all) — the lesson from last review didn't transfer, it just changed shape. Separately, a real bug I found by testing: `guardar`/`obtener`/`actualizar` claim a "defensive copy" via `{ ...item }`, but that's a shallow copy — `createdAt` is a `Date` (mutable object), so its reference is shared between the stored copy and whatever the caller holds. Mutating the `Date` returned from `obtener()` (e.g. `.setFullYear(...)`) silently corrupts the repository's internal state, contradicting the encapsulation the code comments claim. Same gap in `aVistaPublica`: its `createdAt` is the *same* `Date` object as the source `Perfil`.
**Suggested next refactor:**
```ts
// Before (obtener) — shallow copy, Date reference leaks
obtener(id: number): T | undefined {
  const item = datos.get(id);
  return item === undefined ? undefined : { ...item };
}

// After — clone mutable nested fields too (or use structuredClone(item)
// for a general-purpose deep copy if T can contain arbitrary nested data)
```
Also, before calling any exercise done from now on: write the tests the README asks for, compile, and run them — not optional, not "the logic looks right so it's probably fine." That habit is the actual gap here, not generics knowledge.

## 2026-07-06 — [TypeScript] 0005 perfiles-repositorio (fix) — verdict (🟩)
**Score:** Correctness 4 · Readability 4 · Idiomatic 4 · Tests 4 · Errors 4 · Design 4 · Performance 4 · Explanation 4
**Learned:** Fixed the shallow-copy bug properly with `structuredClone` on every boundary (`guardar`/`obtener`/`actualizar`/`aVistaPublica`), with a comment naming the real limitation (throws on functions/class instances). Wrote 12 tests covering the full acceptance criteria: CRUD happy path, id-not-found across all three mutating operations, partial update preserving untouched fields, non-mutation checked independently for the caller's original object/the `cambios` object/a prior snapshot, `aVistaPublica` excluding `passwordHash` at runtime, `indexarPorId` duplicate-id semantics, and — the standout — a dedicated regression test (case 9) that reproduces the exact `Date`-mutation bug from last review, plus a second-entity-type test (case 11, `Producto`) proving `Repositorio<T>` is actually generic rather than assumed generic. Verified independently: compiles clean under `strict --noImplicitAny`, all 12 assertions run and pass via `node`.
**To improve:** Nothing blocking. Unscored note for later: `indexarPorId` stores direct references to the input `Perfil` objects rather than cloning them, so mutating a value read from the index would mutate the source array's element — not required by this exercise, but the same bug category just fixed elsewhere.
**Suggested next refactor:** None needed. First 🟩 on generics/utility types (1/3 toward `level up` for that skill).

## 2026-07-07 — [TypeScript] 0006 estado-pedido-en-vivo — verdict (🟩)
**Score:** Correctness 4 · Readability 4 · Idiomatic 4 · Tests 4 · Errors 4 · Design 4 · Performance 4 · Explanation 4
**Learned:** First exposure to discriminated unions/type guards, but performed at 🟩 without needing any of the hints. `OrderStatus` is modeled as 5 separate types (not one flat type with optional fields), so the exact production bug this exercise was based on (`isDelivered && isCancelled` both `true`) is now unrepresentable. The `never`-exhaustiveness check in `describeStatus` isn't decorative — verified independently by adding a 6th `Refunded` variant in isolation and confirming the unhandled `default` broke compilation (`Type 'Refunded' is not assignable to type 'never'`). `isTerminal` correctly uses `status is Delivered | Cancelled`, not a bare boolean. Both stretch goals done and correct: `canTransition` types its table as `Record<OrderStatus['status'], ...>` so the compiler forces a table update if a 6th state is ever added; `match()` uses `Extract<OrderStatus, {status: K}>` per key with exactly one controlled, documented cast instead of `any` — the standard idiom for this pattern. Tests cover all 5 states plus terminal/non-terminal cases for `isTerminal`, and sidestep `toLocaleString()` locale-flakiness by computing the expected string from the same `Date` instance rather than hardcoding one. Compiles clean under `tsc --strict --noImplicitAny`, all assertions pass via `tsx`.
**To improve:** Comments are overwritten for shipped code — ASCII banner headers and prose explaining what a discriminated union is belong in a note, not in code, per CLAUDE.md's own comment policy (WHY only). Keep the two that earn their place (the `never` trick, why the `match` cast is safe) and cut the rest.
**Suggested next refactor:** Practice-only: trim `order-status.ts` to ~2-3 WHY-comments total and confirm it still reads clearly. First 🟩 on discriminated unions/type guards (1/3 toward `level up` for that skill) — exercise was calibrated 🟥 (first exposure) but result exceeded target on the first attempt.
