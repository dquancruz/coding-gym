// CAPA REPOSITORY — almacenamiento.
// Única responsabilidad: guardar y traer tareas. Genera el `id`.
// No sabe nada de HTTP, de Express, ni de qué prioridad es "válida".
// El día que esto sea Postgres, este es (casi) el ÚNICO archivo que cambia.

import { Tarea } from "../types";

// El estado vive a nivel de módulo: se crea una sola vez al importar el archivo
// y persiste mientras el proceso siga vivo. Esta es la "base de datos en memoria".
let tareas: Tarea[] = [];
let siguienteId = 1;

// Recibe una tarea SIN id, le asigna uno propio, la guarda y la devuelve completa.
// Usamos un contador (no tareas.length) para que los ids nunca se repitan aunque
// después se borre una tarea.
export function guardar(datos: Omit<Tarea, "id">): Tarea {
  const tarea: Tarea = { id: siguienteId, ...datos };
  siguienteId++;
  tareas.push(tarea);
  return tarea;
}

// Devuelve una COPIA del array (no la referencia interna), para que nadie
// pueda modificar el estado del repo desde afuera sin pasar por `guardar`.
export function obtenerTodas(): Tarea[] {
  return [...tareas];
}

// Devuelve la tarea con ese id, o undefined si no existe.
// "No existe" se traduce a undefined; qué hacer con eso es problema del controller.
export function obtenerPorId(id: number): Tarea | undefined {
  return tareas.find((tarea) => tarea.id === id);
}

// Vacía el repo. Se usa sobre todo en los tests: como el estado es en memoria
// y persiste entre un test y el siguiente, hay que reiniciarlo antes de cada uno.
export function limpiar(): void {
  tareas = [];
  siguienteId = 1;
}
