# Stock Service (reserva de stock en memoria)

Servicio de reserva de stock para checkout: cuando alguien pone un producto en
el carrito se le reserva stock, para que dos personas no compren la última
unidad a la vez. Todo en memoria mientras corre el servidor (sin DB ni pasarela
de pago todavía), pero con el modelo de datos y las reglas de negocio correctas.

## Cómo correr

```bash
npm install
npm run test        # tests de integración (supertest + vitest)
npm run typecheck   # TypeScript estricto, sin emitir
npm run dev         # levanta el server con reload (PORT=3000 por defecto)
```

## Rutas

| Método | Ruta                        | Qué hace                                           |
|--------|-----------------------------|----------------------------------------------------|
| POST   | `/productos`                | Crea producto `{ nombre, stockTotal }`             |
| GET    | `/productos/:id`            | Devuelve el producto con `stockDisponible`, o 404  |
| POST   | `/reservas`                 | Crea reserva `{ productoId, cantidad }`            |
| GET    | `/reservas/:id`             | Devuelve la reserva, o 404                          |
| DELETE | `/reservas/:id`             | Cancela reserva activa y libera stock              |
| GET    | `/productos/:id/reservas`   | (stretch) reservas activas del producto            |

## Arquitectura en capas

```
routes/  ──►  controller/  ──►  service/  ──►  repository/
(HTTP)        (HTTP↔dominio)     (negocio)      (persistencia en memoria)
```

- **`routes/`** solo declara paths y engancha middleware de validación.
- **`controller/`** traduce `req`/`res` ↔ dominio y delega errores al handler.
- **`service/`** tiene las reglas de negocio. **No conoce `req`/`res`**: recibe
  datos ya validados y lanza errores de dominio (`NotFoundError`, `ConflictError`).
- **`repository/`** solo persiste en memoria y genera los `id`. **No conoce HTTP.**

El cableado (composition root) está en `src/app.ts`, en `createApp()`, que crea
un grafo con estado nuevo por llamada — por eso los tests pueden tener una app
limpia por test. `app` se exporta separado de `app.listen(...)` (`src/server.ts`)
para que supertest le pegue directo sin bindear puerto.

### `stockDisponible` es calculado, no guardado

`stockDisponible = stockTotal - stockReservado`, siempre computado al leer, para
que nunca pueda quedar desincronizado. El producto guarda `stockReservado`; el
repository protege sus invariantes: nunca `< 0`, nunca `> stockTotal`.

## Decisiones de diseño

### ¿Por qué 409 para "stock insuficiente"?

`cantidad > stockDisponible` responde **409 Conflict**, no 400 ni 422:

- **400** es para requests mal formadas → eso lo cubre Zod (formato del body).
- **422 Unprocessable Entity** aplica cuando el *contenido* del body es
  semánticamente inválido en sí mismo, independiente del estado del servidor.
- **409 Conflict** describe exactamente este caso: la request está bien formada
  pero **choca con el estado ACTUAL del recurso** (el stock en este instante).
  La misma request podría ser válida un segundo después si se cancela otra
  reserva. Ese "depende del estado presente del recurso" es la firma del 409.

### Doble cancelación: no-op idempotente

Cancelar dos veces la misma reserva es un **no-op idempotente**: la segunda
llamada devuelve `200` con la reserva ya `cancelada` y **no vuelve a liberar
stock**. Se eligió idempotencia porque `DELETE` es idempotente por semántica
HTTP: un cliente que reintenta debe ver el mismo resultado, no un error ni un
doble descuento. Lo único inaceptable —liberar stock dos veces— queda bloqueado
por un `return` temprano en `ReservasService.cancelar`.

### Errores: nunca un stack trace crudo

Todo error pasa por un único error handler (`src/middleware/errorHandler.ts`)
que traduce:

- `AppError` (dominio) → su propio `statusCode` + JSON `{ error: { code, message } }`.
- Validación Zod → `400` con `detalles` legibles (en el middleware `validateBody`).
- Cualquier otra cosa → `500` genérico (el detalle se loguea del lado servidor,
  al cliente solo le llega algo seguro).
- Ruta desconocida → `404` JSON.

## Stretch: condición de carrera (análisis, sin implementar)

**Dónde está**: en `ReservasService.crear`, entre leer `stockDisponible` y
llamar a `ajustarReservado` hay un **check-then-act**. En un solo proceso de Node
el event loop lo mantiene atómico (no hay `await` entre el chequeo y la
escritura, así que nada se intercala). El problema aparece con **varios procesos
o instancias** compartiendo una DB real: dos requests pueden leer el mismo
`stockDisponible = 1`, ambas concluir "hay stock" y ambas escribir la reserva →
**oversell** de la última unidad.

**Cómo se resolvería con una DB real** (cualquiera de estas):

1. **UPDATE condicional atómico**: `UPDATE productos SET stock_reservado =
   stock_reservado + :cantidad WHERE id = :id AND stock_reservado + :cantidad
   <= stock_total`. Si afecta 0 filas, no había stock → 409. El chequeo y la
   escritura ocurren en una sola sentencia atómica.
2. **Bloqueo pesimista**: `SELECT ... FOR UPDATE` sobre la fila del producto
   dentro de una transacción, serializando las reservas concurrentes del mismo
   producto.
3. **Invariante en la base**: un `CHECK (stock_reservado <= stock_total)` como
   red de seguridad, para que ni un bug de aplicación pueda persistir oversell.

Otros stretch implementados: `GET /productos/:id/reservas` y un middleware de
logging (`método + ruta + status`) en `src/middleware/logging.ts`.
