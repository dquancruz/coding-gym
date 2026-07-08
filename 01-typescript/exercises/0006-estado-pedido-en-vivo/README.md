# Estado de pedido en vivo
- **Track / Skill:** TypeScript / discriminated unions y type guards
- **Target level:** 🟥
- **Estimated time:** 1–1.5h

## Context
Trabajas en el backend de una app de delivery de comida. El endpoint de
estado de pedido devuelve hoy un objeto con campos opcionales y flags
booleanas sueltas (`isPreparing`, `isOutForDelivery`, `isDelivered`,
`isCancelled`...). Un bug reciente en producción dejó un pedido con
`isDelivered: true` **y** `isCancelled: true` al mismo tiempo, y el frontend
no supo qué mensaje mostrarle al cliente.

Tu tech lead te pidió remodelar el estado con una **discriminated union**
para que ese estado inválido sea literalmente irrepresentable en el sistema
de tipos, y una función que, a partir de ese tipo, decida qué mensaje
mostrarle al cliente usando *narrowing* (no `if` sueltos sobre flags).

## Requirements (acceptance criteria)
- [ ] Definir un tipo `OrderStatus` como discriminated union con un campo
      discriminante común (ej. `status`) para estos 5 estados: `placed`,
      `preparing`, `out_for_delivery`, `delivered`, `cancelled`.
- [ ] Cada estado lleva SOLO los campos que le corresponden (ej.
      `cancelled` tiene `reason: string`; `out_for_delivery` tiene
      `estimatedMinutes: number`; `delivered` tiene `deliveredAt: Date`).
      No pongas todos los campos opcionales en un solo tipo plano.
- [ ] Función `describeStatus(status: OrderStatus): string` que use
      narrowing (switch sobre el discriminante) y devuelva un mensaje
      distinto y específico para cada estado (puede usar los campos
      propios de ese estado en el mensaje).
- [ ] Función type guard `isTerminal(status: OrderStatus): boolean` que
      determine si el pedido ya llegó a un estado final (`delivered` o
      `cancelled`).
- [ ] En el `switch` de `describeStatus`, un `default` que fuerce
      exhaustividad (si mañana se agrega un estado nuevo y no lo manejas,
      TypeScript debe marcar error de compilación, no fallar en runtime).
- [ ] Tests: un caso por cada uno de los 5 estados para `describeStatus`,
      y casos para `isTerminal` (al menos uno terminal y uno no terminal).

## Constraints
- Sin librerías externas (esto se resuelve con el sistema de tipos nativo
  de TypeScript).
- Debe compilar en modo `strict`.
- No uses `any` en ningún punto.

## Hints
- El campo discriminante suele llamarse `status`, `type` o `kind`. Elige
  uno y sé consistente en los 5 miembros de la union.
- Esqueleto de un miembro de la union, para que veas el patrón:
  ```ts
  type Cancelled = {
    status: 'cancelled';
    reason: string;
  };
  ```
  Los otros 4 miembros siguen la misma forma: `status` con su valor
  literal + los campos propios de ese estado.
- Para la exhaustividad, el truco es asignar el valor no manejado a una
  variable de tipo `never` dentro del `default`:
  ```ts
  default: {
    const _exhaustive: never = status;
    throw new Error(`Estado no manejado: ${JSON.stringify(_exhaustive)}`);
  }
  ```
  Si agregas un 6to estado a la union y olvidas manejarlo en el switch,
  esa línea deja de compilar — ese es el punto.
- `isTerminal` puede escribirse simplemente devolviendo un `boolean`; no
  hace falta el predicado `status is X` todavía si te cuesta, pero si
  quieres practicarlo, la firma sería
  `function isTerminal(status: OrderStatus): status is Delivered | Cancelled`.

## Stretch goals (optional, to push toward the next level)
- Agrega una función `canTransition(from: OrderStatus['status'], to: OrderStatus['status']): boolean`
  que valide que las transiciones sigan el flujo real (ej. no se puede
  pasar de `cancelled` a `preparing`).
- Escribe un helper genérico `match<T>(status: OrderStatus, handlers: {...}): T`
  que reciba un objeto con una función por cada estado, para no repetir
  el patrón switch/exhaustividad cada vez que necesites narrowing.
