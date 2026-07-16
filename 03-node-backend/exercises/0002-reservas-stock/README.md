# API de reservas de stock para un e-commerce
- **Track / Skill:** Node backend / REST básico + estructura en capas
- **Target level:** 🟩 (segunda práctica de este skill — sin hints)
- **Estimated time:** 2.5h

## Context
El equipo de checkout de un e-commerce necesita un servicio que reserve
stock cuando alguien pone un producto en el carrito, para que dos personas
no puedan comprar la última unidad al mismo tiempo. Todavía no hay pasarela
de pago ni base de datos (eso viene en otros tracks) — por ahora todo vive
en memoria mientras el servidor corre, pero el modelo de datos y las reglas
de negocio tienen que ser correctos, porque esto es lo que va a decidir si
se vende o no un producto.

Como en 0001, la separación en capas es el objetivo real, pero acá además
hay una regla de negocio con estado que cruzar correctamente: una reserva
le "quita" stock disponible a un producto, y cancelarla se lo devuelve. Si
esa relación entre `producto` y `reserva` no se valida bien en cada paso, el
stock disponible termina mintiendo.

## Requirements (acceptance criteria)
- [ ] Servidor Express con estas rutas:
  - `POST /productos` — crea un producto. Body: `{ nombre: string, stockTotal: number }`.
  - `GET /productos/:id` — devuelve el producto, incluyendo `stockDisponible`
    (calculado, no guardado: `stockTotal - stockReservado`), o `404` si no existe.
  - `POST /reservas` — crea una reserva de stock. Body: `{ productoId: string, cantidad: number }`.
  - `GET /reservas/:id` — devuelve una reserva por id, o `404` si no existe.
  - `DELETE /reservas/:id` — cancela una reserva activa y libera su stock.
- [ ] Estructura en capas en archivos separados (mismo criterio que 0001):
  `routes/` → `controller/` → `service/` → `repository/`. La capa de
  `service` no debe saber qué es un `req`/`res`; el `repository` no debe
  saber qué es HTTP.
- [ ] Validación con Zod en ambos POST: `nombre` no vacío, `stockTotal` entero
  ≥ 0; `productoId` no vacío, `cantidad` entero > 0. Cualquier violación de
  formato responde `400` con un mensaje legible y no toca el estado.
- [ ] Regla de negocio (no es validación de formato, es de negocio — por eso
  va en la capa de `service`, no en el schema de Zod): una reserva no puede
  crearse si `cantidad > stockDisponible` del producto al momento de la
  petición. Esto responde un código de error distinto al de validación de
  formato (pensá cuál es el código HTTP correcto para "la request está bien
  formada pero el estado actual del sistema no la permite", y documentá por
  qué elegiste ese código).
- [ ] Cancelar una reserva (`DELETE /reservas/:id`) devuelve su cantidad al
  stock disponible del producto correspondiente. Verificá específicamente
  que cancelar la reserva de un producto no afecte el stock de otro
  producto que comparta, por ejemplo, el mismo `cantidad`.
- [ ] Decidí y documentá (un comentario corto alcanza, no hace falta un
  archivo aparte) qué pasa si se cancela dos veces la misma reserva: ¿es un
  no-op idempotente, o un error? Cualquiera de las dos es válida — lo que no
  es válido es que el stock se libere dos veces por la misma reserva.
- [ ] Ningún error (de validación, de negocio, o inesperado) debe llegar al
  cliente como un stack trace crudo de Node/Express — siempre una respuesta
  JSON controlada, y con el código de estado que le corresponde a cada tipo
  de error (no todo es `500`).
- [ ] Tests de integración con `supertest` + `vitest` cubriendo, como mínimo:
  creación de producto y reserva exitosas, reserva con `cantidad` mayor al
  stock disponible, reserva sobre un `productoId` inexistente, reserva con
  `cantidad` inválida (0, negativa, no entera), cancelación exitosa (y que
  el stock disponible del producto sube), cancelación de una reserva
  inexistente, y el caso de la doble cancelación según lo que hayas
  decidido arriba.

## Constraints
- Mismo stack que 0001: `express`, `zod`, `supertest`, `vitest`, TypeScript
  estricto. No hay base de datos ni archivos — todo en memoria.
- El `id` de productos y reservas lo genera el repository correspondiente,
  nunca lo manda el cliente.
- `stockReservado` de un producto nunca puede ser negativo ni mayor a
  `stockTotal` — si en algún test lo ves llegar a ese estado, es un bug, no
  un edge case aceptable.
- Exportá `app` (Express) separado de lo que hace `app.listen(...)`, igual
  que en 0001, para que `supertest` le pegue directo sin bindear un puerto.

## Stretch goals (optional, to push toward the next level)
- Agregá `GET /productos/:id/reservas` — lista las reservas activas de un
  producto.
- Pensá qué pasaría si dos requests de `POST /reservas` para el mismo
  producto llegan "al mismo tiempo" en un entorno real con más de un
  proceso de Node corriendo (no hace falta implementar nada, pero dejá por
  escrito dónde está la condición de carrera en tu implementación actual y
  cómo la resolverías con una base de datos real).
- Agregá un middleware de logging (método + ruta + status code) por request.
