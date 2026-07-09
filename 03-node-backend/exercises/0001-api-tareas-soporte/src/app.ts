// Construye y configura la app de Express, pero NO la pone a escuchar.
// Separado de server.ts a propósito: así los tests (supertest) pueden importar
// `app` y pegarle en memoria, sin abrir un puerto real.

import express, { Request, Response, NextFunction } from "express";
import tareasRoutes from "./routes/tareas.routes";

const app = express();

// Parsea el body JSON y llena req.body. Va ANTES de las rutas,
// o el safeParse recibiría undefined en cada POST.
app.use(express.json());

// Monta todas las rutas de tareas bajo el prefijo /tareas.
app.use("/tareas", tareasRoutes);

// Error handler: SIEMPRE al final de la cadena. Express lo reconoce como handler
// de errores por tener 4 parámetros (no por el nombre). Atrapa cualquier excepción
// no controlada y responde un 500 limpio, sin stack trace crudo al cliente.
function tieneStatusCode(err: unknown): err is { statusCode: number } {
  return typeof err === "object" && err !== null &&
    "statusCode" in err && typeof (err as { statusCode: unknown }).statusCode === "number";
}
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const statusCode = tieneStatusCode(err) ? err.statusCode : 500;
  const mensaje = statusCode < 500 ? "Solicitud inválida" : "Error interno del servidor";
  return res.status(statusCode).json({ error: mensaje });
});

export default app;
