// CAPA CONTROLLER — traductor entre HTTP y el dominio.
// La ÚNICA capa que conoce `req` y `res`. Sus tres tareas:
//   1. Validar lo que entra (Zod).
//   2. Llamar al service con datos ya limpios.
//   3. Mapear el resultado al código de estado HTTP correcto.
// No conoce al repository: solo habla con el service.

import { Request, Response } from "express";
import { z } from "zod";
import * as service from "../service/tareas.service";

// Schema de validación del body de POST /tareas.
const crearTareaSchema = z.object({
  titulo: z.string().min(1, "El título no puede estar vacío"),
  prioridad: z.enum(["baja", "media", "alta"]),
});

export function crear(req: Request, res: Response) {
  // safeParse NO lanza excepción: devuelve un objeto que inspeccionamos.
  // Así controlamos la respuesta de error en vez de dejar escapar un stack trace.
  const resultado = crearTareaSchema.safeParse(req.body);

  if (!resultado.success) {
    const mensajes = resultado.error.issues.map((issue) => issue.message);
    return res.status(400).json({ errores: mensajes });
  }

  // Pasado el if, `resultado.data` está tipado y garantizado. Recién ahora
  // el service recibe datos confiables.
  const tarea = service.crearTarea(resultado.data);
  return res.status(201).json(tarea);
}

// req no se usa, pero Express siempre pasa (req, res) POR POSICIÓN: res tiene que
// quedar en el segundo lugar sí o sí. El "_" marca que el parámetro es a propósito.
export function listar(_req: Request, res: Response) {
  return res.status(200).json(service.listarTareas());
}

export function obtener(req: Request, res: Response) {
  // req.params.id llega como string ("5"): hay que convertirlo a número
  // para que el === del repository matchee.
  const id = Number(req.params.id);
  const tarea = service.obtenerTarea(id);

  // El undefined del service se traduce ACÁ en un 404.
  if (tarea === undefined) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  return res.status(200).json(tarea);
}
