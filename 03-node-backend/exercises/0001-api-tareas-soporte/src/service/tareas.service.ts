// CAPA SERVICE — lógica de negocio.
// Recibe y devuelve objetos comunes; nunca toca `req`/`res`.
// Hoy casi solo delega en el repository, pero es EL lugar reservado para las
// reglas de negocio (ej: "no repetir títulos", "máximo N tareas"). Cuando
// aparezcan, van acá, sin tocar ni el repo ni el controller.

import { Tarea } from "../types";
import * as repository from "../repository/tareas.repository";

// Crea una tarea a partir de datos YA validados por el controller.
export function crearTarea(datos: Omit<Tarea, "id">): Tarea {
  return repository.guardar(datos);
}

// Devuelve todas las tareas.
export function listarTareas(): Tarea[] {
  return repository.obtenerTodas();
}

// Devuelve una tarea por id, o undefined si no existe.
export function obtenerTarea(id: number): Tarea | undefined {
  return repository.obtenerPorId(id);
}
