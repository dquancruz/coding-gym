// Tipos del dominio.
// Viven en su propio archivo porque los usan TODAS las capas: el repository
// guarda `Tarea`s, el service las mueve, el controller las serializa a JSON.
// Definirlos en un solo lugar evita que cada capa invente su propia versión.

export type Prioridad = "baja" | "media" | "alta";

export type Tarea = {
  id: number;
  titulo: string;
  prioridad: Prioridad;
};
