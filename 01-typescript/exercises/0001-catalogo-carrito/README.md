# Catálogo y carrito sin `any`

- **Track / Skill:** TypeScript / tipos básicos (interfaces, unions)
- **Nivel objetivo:** 🟥
- **Tiempo estimado:** 1.5h

## Contexto
Te acabas de unir al equipo de una tienda online pequeña. El código actual del
catálogo y el carrito está escrito en JS puro y usa objetos "a mano" sin
ninguna validación de forma — la semana pasada un bug en producción dejó pasar
un carrito con `precio: "10"` (string en vez de number) y rompió el cálculo
del total. Tu primera tarea es migrar la lógica del catálogo/carrito a
TypeScript con tipos explícitos, sin usar `any` en ningún lado.

## Requisitos (criterios de aceptación)
- [ ] Define una `interface Product` con: `id` (string), `nombre` (string),
      `precio` (number), y `estado`, que debe ser una **unión de literales**:
      `'in_stock' | 'low_stock' | 'out_of_stock'` (no un `string` cualquiera).
- [ ] Define un `type CartItem` que sea la **intersección** de `Product` y
      `{ cantidad: number }` (no repitas los campos a mano).
- [ ] Implementa `addToCart(cart: CartItem[], product: Product, cantidad: number): CartItem[]`
      — si el producto ya está en el carrito, suma la cantidad; si no, lo
      agrega. No debe mutar el array `cart` original (debe devolver uno nuevo).
- [ ] Implementa `calculateTotal(cart: CartItem[]): number` que sume
      `precio * cantidad` de todos los items.
- [ ] Implementa `applyDiscount(product: Product, porcentaje: number): Product`
      que devuelva un **nuevo** objeto con el precio reducido por ese
      porcentaje, sin mutar el `product` original.
- [ ] No debe haber ningún `any` explícito ni implícito en tu código (revisa
      que tampoco dependas de inferencia laxa — sé explícito en las firmas de
      función).

## Restricciones
- TypeScript puro, sin librerías externas (ni siquiera para tests todavía).
- Debe compilar sin errores con `strict: true`.
- No modifiques `product.estado` fuera de las funciones — pero tampoco hace
  falta lógica de negocio para recalcular el estado en este ejercicio (eso
  vendrá después, con discriminated unions).

## Pistas (nivel 🟥)
- `interface` para las formas de datos que puedan crecer (como `Product`);
  `type` es obligatorio para uniones e intersecciones (`|`, `&`).
- Para "no mutar el original", usa spread (`{ ...obj }`) o `.map()`/`.filter()`
  en vez de `push`/reasignación directa de propiedades.
- Si te tienta usar `any` para "que compile", es señal de que falta modelar
  bien el tipo — vuelve al requisito y piénsalo de nuevo.
- No hace falta manejar el caso `porcentaje` inválido (negativo, >100) en esta
  versión — eso es un stretch goal.

## Stretch goals (opcional, para empujar a mid)
- Valida en `applyDiscount` que `porcentaje` esté entre 0 y 100; si no,
  decide (y justifica) qué hacer: ¿lanzar error, clamp, devolver el mismo
  producto?
- Usa `Readonly<Product>` en las firmas para dejar explícito por tipos que las
  funciones no mutan su entrada.
- Escribe 2-3 casos de prueba simples (aunque sea con `console.assert` o un
  archivo `tests/manual.ts` que ejecutes con `ts-node`), sin instalar un
  framework de testing todavía.
