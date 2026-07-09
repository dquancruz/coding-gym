# API de tareas para el equipo de soporte
- **Track / Skill:** Node backend / REST básico + estructura en capas
- **Target level:** 🟥
- **Estimated time:** 2h

## Context
El equipo de soporte interno todavía coordina tareas por chat, y se pierden
todo el tiempo. Te piden un backend mínimo: una API REST donde puedan crear
tareas, listarlas, y consultar una en particular por id. No hay base de
datos todavía (eso viene en el track de SQL) — por ahora todo vive en
memoria mientras el servidor corre.

El objetivo real de este ejercicio no es el CRUD en sí (eso ya lo hiciste
mentalmente mil veces), es la **separación en capas**: la ruta no debe saber
nada de cómo se guardan los datos, y la lógica de negocio no debe saber nada
de Express. Cada capa habla solo con la de al lado.

## Requirements (acceptance criteria)
- [ ] Servidor Express con estas rutas:
  - `POST /tareas` — crea una tarea. Body: `{ titulo: string, prioridad: "baja" | "media" | "alta" }`.
  - `GET /tareas` — devuelve todas las tareas.
  - `GET /tareas/:id` — devuelve una tarea por id, o 404 si no existe.
- [ ] Estructura en capas, en archivos separados:
  - `routes/` — define los endpoints y delega al controller. No contiene lógica.
  - `controller/` — traduce entre HTTP (req/res) y la capa de servicio. No sabe cómo se guardan los datos.
  - `service/` — la lógica de negocio (ej: generar el id, validar reglas). No sabe qué es un `req` o un `res`.
  - `repository/` — el almacenamiento en memoria (un array o `Map`). No sabe qué es HTTP.
- [ ] Validación del body de `POST /tareas` con Zod (ya la usaste en el
  track de TypeScript — mismo patrón acá): si `titulo` está vacío o
  `prioridad` no es uno de los 3 valores válidos, la API responde `400`
  con un mensaje legible, y la tarea NO se crea.
- [ ] Códigos de estado correctos: `201` al crear, `200` al listar/consultar,
  `400` en validación fallida, `404` si el id no existe.
- [ ] Ningún error debe llegar al cliente como un stack trace crudo de
  Node/Express — siempre una respuesta JSON controlada.
- [ ] Tests de integración con `supertest` + `vitest` cubriendo: creación
  exitosa, creación con `titulo` vacío (400), creación con `prioridad`
  inválida (400), listado con 0 y con 2+ tareas, consulta por id existente,
  consulta por id inexistente (404).

## Constraints
- Necesitás instalar `express`, `supertest` y `@types/express` /
  `@types/supertest` como dependencias del proyecto (no están instaladas
  todavía). `zod` y `vitest` ya están disponibles.
- Sin base de datos ni archivos — el repository es 100% en memoria (se
  resetea si el servidor se reinicia, y eso está bien para este ejercicio).
- El `id` de cada tarea lo genera el repository (no lo mandes en el body del
  POST).
- Para que los tests puedan levantar el servidor sin bindear un puerto real,
  exportá la instancia de `app` (Express) desde un archivo separado del que
  hace `app.listen(...)` — `supertest` puede pegarle directo a `app` sin que
  esté escuchando en ningún puerto.

## Hints
- La firma típica de cada capa: `router` llama a `controller.crear(req, res)`
  → `controller` llama a `service.crearTarea(datosValidados)` → `service`
  llama a `repository.guardar(tarea)`. Cada función de una capa no debería
  recibir ni devolver nada que sea "de Express" (nada de `req`/`res`) salvo
  la capa de `controller`.
- Un error de validación centralizado: podés usar el mismo patrón
  `pedidoSchema.safeParse(...)` que ya usaste en TypeScript — si falla,
  el controller responde `400` con los mensajes; si pasa, recién ahí llama
  al service con datos ya tipados y confiables.
- `supertest` se usa así: `request(app).post('/tareas').send({...})` — no
  necesitás levantar el servidor manualmente en los tests.
- Para el error handling "sin stack traces crudos": un middleware de error
  de Express (4 parámetros: `(err, req, res, next)`) al final de la cadena
  de middlewares, que capture cualquier excepción no controlada y responda
  `500` con un JSON genérico.

## Stretch goals (optional, to push toward the next level)
- Agregá `PATCH /tareas/:id` para marcar una tarea como completada
  (`{ completada: true }`), respetando la misma separación en capas.
- Agregá un middleware de logging simple (método + ruta + status code) que
  se ejecute en cada request.
- Pensá (no hace falta implementarlo): si mañana este repository en memoria
  se reemplaza por Postgres, ¿qué archivos cambian y cuáles quedan
  intactos? Si la respuesta es "casi todos cambian", la separación en capas
  no está cumpliendo su propósito.
