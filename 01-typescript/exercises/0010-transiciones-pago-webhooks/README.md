# Transiciones de estado de un pago vía webhooks del gateway
- **Track / Skill:** TypeScript / discriminated unions y type guards — hacia el `level up` (necesitás 2 🟩 consecutivos más en este skill)
- **Target level:** 🟩 (segunda vez en este skill — sin hints)
- **Estimated time:** 1.5–2h

## Context
Estás construyendo el receptor de webhooks de un gateway de pagos (piensa
Stripe/MercadoPago) para el backend de un marketplace. El gateway te avisa
por HTTP POST cada vez que algo le pasa a un pago: se autorizó, se capturó,
falló, se reembolsó (total o parcialmente, y a veces en varias cuotas). El
body de cada webhook llega como JSON crudo — es decir, en tu handler entra
como `unknown` hasta que vos lo valides. El gateway reintenta webhooks que
no confirmaste a tiempo, así que el mismo evento puede llegarte más de una
vez.

El sistema actual guarda el estado del pago en un objeto con campos sueltos
y ya tuvo un incidente: un reembolso parcial duplicado (por un reintento del
gateway) hizo que `montoReembolsado` superara `montoCapturado`, y el finance
team recién lo notó al reconciliar al final del mes.

Te piden remodelar esto con una discriminated union para el estado del pago,
narrowing seguro del JSON del webhook, y una función de transición que
aplique reglas de negocio explícitas — nada de "probablemente esto no pasa".

## Requirements (acceptance criteria)
- [ ] Tipo `EstadoPago` como discriminated union (campo discriminante
      `status`) con estos 6 miembros, cada uno con SOLO los campos que le
      corresponden:
  - `creado` (sin monto todavía)
  - `autorizado` (`authCode: string`, `montoAutorizado: number`)
  - `capturado` (`montoCapturado: number`, `capturadoEn: Date`)
  - `parcialmente_reembolsado` (`montoCapturado: number`,
    `montoReembolsado: number`, `reembolsos: { monto: number; en: Date }[]`)
  - `reembolsado` (`montoCapturado: number`, `montoReembolsado: number`,
    `reembolsos: { monto: number; en: Date }[]`) — el reembolso total
  - `fallido` (`motivo: string`, `en: Date`)
- [ ] Tipo `EventoGateway` como discriminated union (campo discriminante
      `type`) para los eventos que puede mandar el gateway:
      `autorizacion_exitosa`, `autorizacion_fallida`, `captura_exitosa`,
      `captura_fallida`, `reembolso_emitido`. Cada uno con los campos que
      realmente necesita (ej. `reembolso_emitido` necesita `monto: number`
      y `en: Date`).
- [ ] Función `parsearEventoGateway(raw: unknown): EventoGateway | null` que
      reciba el resultado de `JSON.parse(body)` (o sea, literalmente
      cualquier cosa) y devuelva el evento tipado si es válido, o `null` si
      no lo es. Nunca debe lanzar una excepción, sin importar qué basura le
      pases (objetos sin campos, campos con el tipo equivocado, `type`
      desconocido, arrays, `null`, primitivos sueltos).
- [ ] Función `aplicarEvento(estado: EstadoPago, evento: EventoGateway): EstadoPago`
      que aplique el evento al estado actual respetando estas reglas:
  - No se puede capturar un pago que no esté `autorizado`.
  - No se puede reembolsar un pago que no esté `capturado` o
    `parcialmente_reembolsado`.
  - La suma de todos los reembolsos nunca puede superar `montoCapturado`.
    Si un `reembolso_emitido` haría que la suma se pase, es una transición
    inválida.
  - Cuando la suma de reembolsos iguala exactamente `montoCapturado`, el
    estado resultante es `reembolsado`, no `parcialmente_reembolsado`.
  - Un pago en `fallido` o `reembolsado` es terminal: ningún evento nuevo lo
    debería mover de ahí.
  - Cuando una transición es inválida según las reglas de arriba, vos
    elegís el mecanismo (throw vs. tipo Resultado) — justificá la elección
    en un comentario, considerando que esto corre dentro de un handler de
    webhook HTTP (¿qué le tenés que responder al gateway si falla?).
- [ ] El `switch` que decide qué hacer con cada tipo de evento debe forzar
      exhaustividad (si se agrega un 6to tipo de evento y no se maneja,
      debe fallar la compilación, no el runtime).
- [ ] Decisión abierta que tenés que resolver y documentar: el gateway
      reintenta webhooks no confirmados, así que el mismo evento (mismo
      `type`, mismos datos) puede llegar duplicado. Decidí qué hace
      `aplicarEvento` ante un evento que ya fue aplicado antes (ej. un
      segundo `captura_exitosa` sobre un pago que ya está `capturado`) —
      ¿lo tratás como transición inválida, o como no-op idempotente? No hay
      una respuesta "correcta" única, pero tenés que elegir una, explicar
      por qué, y cubrirla con un test.
- [ ] Tests que cubran al menos:
  - Camino feliz completo: `creado` → `autorizado` → `capturado` →
    `reembolsado` (reembolso total en un solo evento).
  - Camino feliz con reembolsos parciales: dos `reembolso_emitido` que
    juntos igualan `montoCapturado` → termina en `reembolsado`, no
    `parcialmente_reembolsado`.
  - Un reembolso parcial que deja el pago en `parcialmente_reembolsado`
    (sin llegar al total).
  - Intentar capturar sin autorización previa → transición inválida.
  - Intentar reembolsar más de lo capturado (ya sea en un solo evento o
    acumulado entre varios) → transición inválida.
  - Intentar aplicar cualquier evento sobre un pago `fallido` o ya
    `reembolsado` → transición inválida.
  - El caso de evento duplicado que elegiste arriba, con la conducta que
    decidiste.
  - `parsearEventoGateway` con al menos 4 payloads basura distintos
    (`null`, `{}`, `{ type: 'algo_que_no_existe' }`, un campo con el tipo
    equivocado como `monto: "100"` en vez de number) → todos devuelven
    `null`, ninguno lanza.
  - `parsearEventoGateway` con un payload válido para cada uno de los 5
    tipos de evento.

## Constraints
- TypeScript puro, sin librerías externas (el parseo de `unknown` es con
  type guards manuales — Zod todavía no, eso es otro skill).
- Debe compilar sin errores con `strict: true` y `noImplicitAny`.
- Cero `any`, explícito o implícito.
- No hay firmas de función dadas más allá de las especificadas arriba —
  completá el resto vos (tipos de los campos internos, helpers, etc.).

## Stretch goals (optional, to push toward the next level)
- Agregá `canTransition(from: EstadoPago['status'], eventType: EventoGateway['type']): boolean`
  tipada como tabla exhaustiva (`Record`) sobre los pares estado×evento,
  para que agregar un estado o evento nuevo sin actualizar la tabla sea
  error de compilación.
- El incidente real que motivó este ejercicio fue justamente un reembolso
  duplicado no detectado hasta la reconciliación mensual. Más allá de la
  decisión de idempotencia, ¿qué dejarías loggeado en `aplicarEvento` para
  que alguien de finance pueda auditar cada transición sin tener que leer
  el código? No hace falta implementarlo — un comentario de 3-4 líneas con
  qué campos loggearías y por qué alcanza.
