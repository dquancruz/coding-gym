import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

/**
 * Un error de una lib de terceros (p. ej. body-parser en `express.json()` ante
 * un JSON mal formado) que ya sabe que es culpa del cliente. body-parser marca
 * estos con `statusCode: 400` y `expose: true`; si lo ignoramos, un error del
 * CLIENTE termina reportado como una falla del SERVIDOR.
 */
function tieneStatusCodeDeCliente(err: unknown): err is { statusCode: number } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'statusCode' in err &&
    typeof (err as { statusCode: unknown }).statusCode === 'number' &&
    (err as { statusCode: number }).statusCode >= 400 &&
    (err as { statusCode: number }).statusCode < 500
  );
}

/**
 * Error handler central (capa HTTP). Es el ÚNICO lugar que traduce errores a
 * respuestas. Garantiza que ningún error —de negocio o inesperado— llegue al
 * cliente como un stack trace crudo: siempre JSON controlado con su status.
 *
 * Express identifica un error handler por su firma de 4 argumentos; `_next`
 * debe existir aunque no se use.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (tieneStatusCodeDeCliente(err)) {
    res.status(err.statusCode).json({
      error: { code: 'BAD_REQUEST', message: 'La petición no pudo procesarse' },
    });
    return;
  }

  // Cualquier otra cosa es un bug no previsto -> 500 genérico. Logueamos el
  // detalle del lado servidor, pero al cliente solo le mandamos algo seguro.
  // eslint-disable-next-line no-console
  console.error('[error-inesperado]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocurrió un error interno inesperado',
    },
  });
}

/** 404 para rutas no registradas, también en JSON controlado. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' },
  });
}
