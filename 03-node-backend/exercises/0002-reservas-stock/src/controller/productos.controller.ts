import type { Request, Response, NextFunction } from 'express';
import type { ProductosService } from '../service/productos.service.js';
import type { ReservasService } from '../service/reservas.service.js';
import type { CrearProductoInput } from '../schemas/index.js';

/**
 * Controller de productos: traduce HTTP <-> dominio. Lee el body ya validado de
 * `res.locals`, invoca el service y arma la respuesta. Cualquier error lo
 * delega al error handler con `next(err)`; no decide status de errores.
 */
export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
    private readonly reservasService: ReservasService,
  ) {}

  crear = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const body = res.locals.body as CrearProductoInput;
      const producto = this.productosService.crear(body);
      res.status(201).json(producto);
    } catch (err) {
      next(err);
    }
  };

  obtener = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const producto = this.productosService.obtener(req.params.id ?? '');
      res.status(200).json(producto);
    } catch (err) {
      next(err);
    }
  };

  /** Stretch: GET /productos/:id/reservas */
  listarReservas = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const reservas = this.reservasService.listarActivasPorProducto(
        req.params.id ?? '',
      );
      res.status(200).json(reservas);
    } catch (err) {
      next(err);
    }
  };
}
