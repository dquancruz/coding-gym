import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny, infer as ZodInfer } from 'zod';

/**
 * Middleware que valida `req.body` contra un schema de Zod. Si falla, responde
 * 400 con un mensaje legible y NO llega al controller (o sea, no toca estado).
 * Si pasa, reemplaza `req.body` por el valor parseado (ya con trims aplicados).
 *
 * Guarda el resultado tipado en `res.locals.body` para que el controller lo
 * consuma con tipos, sin castear a mano.
 */
export function validateBody<S extends ZodTypeAny>(schema: S) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const detalles = result.error.issues.map((i) => ({
        campo: i.path.join('.') || '(body)',
        mensaje: i.message,
      }));
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'El cuerpo de la petición es inválido',
          detalles,
        },
      });
      return;
    }
    res.locals.body = result.data as ZodInfer<S>;
    next();
  };
}
