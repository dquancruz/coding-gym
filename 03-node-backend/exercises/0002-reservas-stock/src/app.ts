import express, { type Express } from 'express';

import { ProductosRepository } from './repository/productos.repository.js';
import { ReservasRepository } from './repository/reservas.repository.js';
import { ProductosService } from './service/productos.service.js';
import { ReservasService } from './service/reservas.service.js';
import { ProductosController } from './controller/productos.controller.js';
import { ReservasController } from './controller/reservas.controller.js';
import { productosRouter } from './routes/productos.routes.js';
import { reservasRouter } from './routes/reservas.routes.js';
import { requestLogger } from './middleware/logging.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Fábrica de la app. Cada llamada crea un grafo de dependencias NUEVO con su
 * propio estado en memoria; esto hace que los tests puedan tener una app limpia
 * por archivo, sin fugas de estado entre casos.
 *
 * Se exporta separado de `app.listen(...)` para que supertest le pegue directo.
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(requestLogger); // stretch: log método + ruta + status

  // Composition root: se cablea aquí, de abajo hacia arriba.
  const productosRepo = new ProductosRepository();
  const reservasRepo = new ReservasRepository();

  const productosService = new ProductosService(productosRepo);
  const reservasService = new ReservasService(reservasRepo, productosRepo);

  const productosController = new ProductosController(
    productosService,
    reservasService,
  );
  const reservasController = new ReservasController(reservasService);

  app.use('/productos', productosRouter(productosController));
  app.use('/reservas', reservasRouter(reservasController));

  app.use(notFoundHandler); // 404 JSON para rutas desconocidas
  app.use(errorHandler); // siempre el último: traduce todo error a JSON

  return app;
}

/** Instancia por defecto (útil para el server y para un uso simple). */
export const app = createApp();
