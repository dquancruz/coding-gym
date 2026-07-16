/**
 * Jerarquía de errores de dominio. Cada uno lleva su propio `statusCode` y un
 * `code` legible, de modo que el error handler central pueda traducirlos a una
 * respuesta JSON controlada sin tener que conocer los detalles de cada capa.
 *
 * La capa de `service` lanza estos errores; NO conoce `req`/`res`. Es el
 * middleware de errores (capa HTTP) quien decide cómo serializarlos.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** El recurso pedido no existe (producto o reserva). -> 404 */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
}

/**
 * La request está bien formada (pasó Zod) pero el estado actual del sistema no
 * la permite: p. ej. no hay stock disponible suficiente.
 *
 * Elegimos 409 Conflict (no 422) a propósito:
 *   - 400 es para requests mal formadas -> lo cubre Zod.
 *   - 422 Unprocessable Entity aplica cuando el *contenido* del body es
 *     semánticamente inválido en sí mismo, independientemente del estado del
 *     servidor.
 *   - 409 Conflict describe exactamente esto: la request choca con el estado
 *     ACTUAL de un recurso (el stock del producto en este instante). La misma
 *     request podría ser válida un segundo después si se cancela otra reserva.
 *     Ese "depende del estado presente del recurso" es la firma del 409.
 */
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
}
