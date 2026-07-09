// CAPA ROUTES — mapa de URLs.
// Solo conecta "método + ruta" con la función del controller. Cero lógica.
// Las rutas arrancan en "/" porque el prefijo /tareas se monta en app.ts.

import { Router } from "express";
import * as controller from "../controller/tareas.controller";

const router = Router();

// Se pasa la función SIN ejecutarla: Express la llama él cuando llega un request.
router.post("/", controller.crear);
router.get("/", controller.listar);
router.get("/:id", controller.obtener); // :id se lee después en req.params.id

export default router;
