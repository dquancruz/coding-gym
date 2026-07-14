# Bus de eventos tipado para notificaciones internas

- **Track / Skill:** TypeScript / generics y utility types (mapped types, `keyof`, indexed access, y como stretch: conditional types + `infer`)
- **Target level:** 🟨 (segunda práctica de este skill — 0005 ya se resolvió en 🟩 tras el fix; esta va sin hints)
- **Estimated time:** 1h30

## Contexto
El backend de un e-commerce interno necesita un mecanismo de pub/sub para
desacoplar módulos: cuando se coloca una orden, falla un pago, baja el stock
de un producto, o se registra un usuario nuevo, distintas partes del sistema
(analytics, emails, alertas de stock) necesitan enterarse sin que el módulo
que dispara el evento sepa quién está escuchando. Te piden construir ese bus
de eventos, pero con un requisito no negociable: **cada tipo de evento tiene
su propia forma de payload, y el compilador tiene que impedir que alguien
suscriba un handler con el payload equivocado a un evento** (por ejemplo, un
handler que espera `{ productoId: string }` no debe poder registrarse para
`"PagoFallido"`, que tiene un payload distinto).

No se te da la firma exacta de nada más allá de lo descrito abajo — el
diseño del tipo genérico es parte del ejercicio.

## Requisitos (criterios de aceptación)

- [ ] Definí un mapa de eventos (`EventMap` o el nombre que prefieras) con
      al menos 4 eventos y payloads distintos entre sí, por ejemplo:
      `"OrdenColocada"`, `"PagoFallido"`, `"StockBajo"`, `"UsuarioRegistrado"`
      (podés usar estos u otros, pero necesitás 4+ con formas realmente
      distintas, no todas `{ id: string }`).
- [ ] Construí una función fábrica genérica (ej. `crearBus<TEventMap extends
      Record<string, unknown>>()`) que devuelva un objeto con al menos:
  - `on(evento, handler)`: suscribe un handler a un evento. El tipo del
    `payload` que recibe `handler` debe inferirse automáticamente del
    evento elegido (si el evento es `"PagoFallido"`, TypeScript debe exigir
    que `handler` reciba el payload de `PagoFallido`, no otro). Debe
    devolver una función para desuscribirse.
  - `off(evento, handler)`: desuscribe un handler específico de un evento.
  - `emit(evento, payload)`: dispara el evento, ejecutando todos los
    handlers suscritos a ese evento, en el orden en que se suscribieron.
      El `payload` que se le pasa debe estar tipado según el evento — no
      puede aceptar cualquier cosa.
- [ ] Ningún `any` explícito ni implícito. Debe compilar en `strict: true`.
- [ ] Comportamiento a definir explícitamente vos (documentalo en un
      comentario corto o en `notes/`, con la razón de la elección):
  - ¿Qué pasa si un handler suscrito **tira una excepción** durante
    `emit`? ¿Se detiene la ejecución de los handlers restantes para ese
    evento, o siguen corriendo los demás igual?
  - ¿Llamar dos veces a la función de desuscripción que devuelve `on`
    (o llamar `off` con un handler que ya no está suscrito) rompe algo, o
    es una operación segura (idempotente)?
  - ¿`emit` de un evento sin ningún handler suscrito debe hacer algo
    especial o simplemente no hacer nada?
- [ ] Tests que cubran como mínimo:
  - Un handler recibe el payload correcto al emitir su evento.
  - Múltiples handlers suscritos al mismo evento son todos invocados, en
    orden de suscripción.
  - Un handler suscrito a un evento NO es invocado cuando se emite un
    evento distinto (aislamiento entre tipos de evento).
  - Desuscribir con la función devuelta por `on` efectivamente detiene
    las notificaciones futuras a ese handler.
  - Desuscribir con `off` tiene el mismo efecto que la función devuelta
    por `on`.
  - El comportamiento que decidiste para "handler que tira excepción" y
    para "desuscribir dos veces" — con un test que lo demuestre, no solo
    un comentario.

## Restricciones
- TypeScript puro, sin librerías externas (no Node's `EventEmitter`, no
  `mitt`, ni similares) — la implementación del bus es el ejercicio.
- Sin firmas dadas más allá de lo descrito arriba.

## Stretch goals (opcional, para empujar a 🟩)
- Agregá `onOnce(evento, handler)`: como `on`, pero se desuscribe
  automáticamente después de la primera invocación.
- Implementá un tipo condicional con `infer` que, dado el tipo de una
  función handler, extraiga el tipo de su payload sin que vos lo repitas a
  mano (ej. `type PayloadDe<H> = H extends (payload: infer P) => void ? P :
  never`), y usalo en algún punto de la firma de `on`/`off` en lugar de
  escribir el tipo del payload de nuevo.
- Documentá en 2-3 líneas: ¿por qué elegiste `Record<Evento, Handler[]>`
  (o la estructura que hayas usado) para guardar los listeners, y qué
  alternativa descartaste (por ejemplo, un `Map`)?
