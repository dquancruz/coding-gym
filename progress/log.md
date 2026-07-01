# Bitácora

> Formato por entrada (Claude Code la añade tras cada `revisar`):
>
> ## YYYY-MM-DD — [Track] NNNN Título — veredicto (🟥/🟨/🟩)
> **Nota:** Correctitud X · Legibilidad X · Idiomático X · Tests X · Errores X · Diseño X · Rendimiento X · Explicación X
> **Aprendí:** ...
> **A mejorar:** ...
> **Siguiente refactor sugerido:** ...

---

## 2026-07-01 — [TypeScript] 0001 catalogo-carrito — veredicto (🟥)
**Nota:** Correctitud 1 · Legibilidad 2 · Idiomático 2 · Tests 1 · Errores 2 · Diseño 1 · Rendimiento 3 · Explicación 1
**Aprendí:** `interface Product` bien tipado, unión de literales en `estado` correcta, cero `any` (verificado con `tsc --strict`). `applyDiscount` y `calculateTotal` están bien resueltos con spread/reduce inmutables.
**A mejorar:** `CartItem` no es la intersección pedida (`Product & { cantidad: number }`) — quedó como interface anidada (`{ product, quantity }`), que evita justo el ejercicio de componer tipos con `&`. `addToCart` no cumple ni la firma (`cart: CartItem[], product, cantidad`) ni el comportamiento (sumar cantidad si ya existe, devolver array nuevo): recibe un solo `CartItem` en vez de un array, y devuelve `CartItem | String` — el `String` con mayúscula es el wrapper-object, no el primitivo `string`.
**Siguiente refactor sugerido:** Reescribir `CartItem` como `type CartItem = Product & { cantidad: number }` y reimplementar `addToCart` buscando con `.find()`/`.map()` sobre el array para sumar cantidades o agregar el item, devolviendo siempre un array nuevo.

## 2026-07-01 — [TypeScript] 0001 catalogo-carrito (corrección) — veredicto (🟥, resuelto con guía)
**Nota:** Correctitud 3 · Legibilidad 3 · Idiomático 3 · Tests 1 · Errores 2 · Diseño 3 · Rendimiento 3 · Explicación 1
**Aprendí:** Aplicó correctamente `CartItem = Product & { quantity: number }` y reescribió `addToCart` con la firma y comportamiento pedidos (`.some()` + `.map()`/spread, sin mutar, suma cantidad si ya existe). Compila limpio en `strict`, sin `any`.
**A mejorar:** La corrección siguió casi textualmente el fix que le di en la revisión anterior — no fue resuelto de cero sin pistas, así que no cuenta como demostración de nivel 🟨. Sigue usando nombres de campo en inglés (`name`/`price`/`state`) en vez de los pedidos en el enunciado (`nombre`/`precio`/`estado`).
**Siguiente refactor sugerido:** Para contar hacia el ascenso, resolver el próximo ejercicio de intersecciones/firmas de función sin que yo dé el código de corrección — solo señalar el error y dejar que lo modele solo.
