import { Router } from 'express';
import type { ProductosController } from '../controller/productos.controller.js';
import { validateBody } from '../middleware/validate.js';
import { crearProductoSchema } from '../schemas/index.js';

/** Define las rutas de productos. Solo conoce HTTP; delega todo al controller. */
export function productosRouter(controller: ProductosController): Router {
  const router = Router();

  router.post('/', validateBody(crearProductoSchema), controller.crear);
  router.get('/:id', controller.obtener);
  router.get('/:id/reservas', controller.listarReservas); // stretch

  return router;
}
