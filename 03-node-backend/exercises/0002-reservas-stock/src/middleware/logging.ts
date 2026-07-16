import type { Request, Response, NextFunction } from 'express';

/**
 * Stretch: logging por request. Se engancha en el evento `finish` de la
 * respuesta para poder loguear el status code REAL una vez resuelta, no antes.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const inicio = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - inicio;
    // eslint-disable-next-line no-console
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}
