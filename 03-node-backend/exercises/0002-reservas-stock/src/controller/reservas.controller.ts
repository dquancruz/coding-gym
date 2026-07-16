import type { Request, Response, NextFunction } from 'express';
import type { ReservasService } from '../service/reservas.service.js';
import type { CrearReservaInput } from '../schemas/index.js';

/**
 * Controller de reservas: traduce HTTP <-> dominio. No decide reglas de negocio
 * ni status de errores; delega en el service y en el error handler.
 */
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  crear = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const body = res.locals.body as CrearReservaInput;
      const reserva = this.reservasService.crear(body);
      res.status(201).json(reserva);
    } catch (err) {
      next(err);
    }
  };

  obtener = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const reserva = this.reservasService.obtener(req.params.id ?? '');
      res.status(200).json(reserva);
    } catch (err) {
      next(err);
    }
  };

  cancelar = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const reserva = this.reservasService.cancelar(req.params.id ?? '');
      res.status(200).json(reserva);
    } catch (err) {
      next(err);
    }
  };
}
