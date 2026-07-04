# Log

> Entry format (Claude Code adds one after every `review`):
>
> ## YYYY-MM-DD — [Track] NNNN Title — verdict (🟥/🟨/🟩)
> **Score:** Correctness X · Readability X · Idiomatic X · Tests X · Errors X · Design X · Performance X · Explanation X
> **Learned:** ...
> **To improve:** ...
> **Suggested next refactor:** ...

---

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
