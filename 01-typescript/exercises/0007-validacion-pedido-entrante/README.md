# Validación de pedidos entrantes con Zod
- **Track / Skill:** TypeScript / Runtime validation (Zod)
- **Target level:** 🟥
- **Estimated time:** 1h

## Context
Trabajás en el backend de un e-commerce. Un sistema legacy de otro equipo
te empuja pedidos nuevos como JSON crudo a través de un webhook. Ese JSON
llega tipado como `unknown` (o en el mejor de los casos `any`) porque viene
de fuera de tu programa — TypeScript no puede protegerte en el borde del
sistema, sus tipos desaparecen en runtime. Necesitás validar la forma real
del dato ANTES de confiar en él en el resto del código.

Tu tarea es escribir la validación con **Zod** para el payload de un pedido
entrante, y una función que lo procese solo si es válido.

## Requirements (acceptance criteria)
- [ ] Definí un schema de Zod (`pedidoSchema`) que describa un pedido con:
  - `id`: string no vacío
  - `clienteEmail`: string con formato de email válido
  - `items`: array de al menos 1 elemento, cada uno con `sku` (string no
    vacío) y `cantidad` (número entero positivo)
  - `total`: número positivo
  - `moneda`: uno de `"USD" | "ARS" | "EUR"` (usá un enum de Zod, no un
    string suelto)
- [ ] Derivá el tipo TypeScript del pedido a partir del schema con
  `z.infer` — no escribas una interface manual duplicada.
- [ ] Escribí `procesarPedido(payload: unknown)` que:
  - valide `payload` contra `pedidoSchema`
  - si es válido, devuelva `{ ok: true, pedido: Pedido }`
  - si es inválido, devuelva `{ ok: false, errores: string[] }` con
    mensajes legibles (no el objeto crudo de Zod) — por ejemplo
    `"items.0.cantidad: debe ser un número positivo"`
- [ ] `procesarPedido` NUNCA debe lanzar (throw) por un payload inválido —
  el llamador siempre recibe un resultado, nunca una excepción.

## Constraints
- Usá la librería `zod` (asumí que ya está instalada — no necesitás
  configurar nada, solo importarla: `import { z } from "zod"`).
- No uses `any` en ningún punto. `unknown` es el único tipo válido para el
  payload de entrada antes de validarlo.

## Hints
- `z.infer<typeof pedidoSchema>` te da el tipo sin duplicar código.
- El resultado de `.safeParse()` (no `.parse()`) es lo que te deja evitar el
  throw: `{ success: true, data }` o `{ success: false, error }`.
- `error.issues` (dentro del resultado de `safeParse` cuando falla) es un
  array; cada issue tiene `.path` (dónde falló) y `.message` (por qué). Un
  `.map` sobre eso arma tus strings legibles.
- Para el email, `z.string().email()` alcanza — no hace falta un regex
  propio.

## Stretch goals (optional, to push toward the next level)
- Agregá una regla cruzada: `total` debe ser aproximadamente igual a la
  suma de `cantidad` de cada item (asumiendo que tuvieras un precio unitario
  — si no lo tenés en el payload, saltá este stretch o justificá por qué no
  se puede validar sin ese dato).
- Escribí 3–4 casos de prueba con Vitest cubriendo: payload válido, email
  inválido, `items` vacío, y `cantidad` negativa.
