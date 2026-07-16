import { Router } from 'express';
import type { ReservasController } from '../controller/reservas.controller.js';
import { validateBody } from '../middleware/validate.js';
import { crearReservaSchema } from '../schemas/index.js';

/** Define las rutas de reservas. Solo conoce HTTP; delega todo al controller. */
export function reservasRouter(controller: ReservasController): Router {
  const router = Router();

  router.post('/', validateBody(crearReservaSchema), controller.crear);
  router.get('/:id', controller.obtener);
  router.delete('/:id', controller.cancelar);

  return router;
}
