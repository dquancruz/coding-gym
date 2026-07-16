import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

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
