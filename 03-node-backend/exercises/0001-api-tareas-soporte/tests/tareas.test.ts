// Tests de integración: NO probamos cada capa aislada, probamos la app ENTERA
// de punta a punta. supertest le manda requests HTTP reales a `app` (en memoria,
// sin puerto), y verificamos status + body. Si algo se rompe en cualquier capa,
// estos tests lo agarran.

import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { limpiar } from "../src/repository/tareas.repository";

// El repo guarda su estado en memoria y ese estado PERSISTE entre un test y otro.
// Sin este reset, "devuelve array vacío" fallaría si corre después de un test que
// creó tareas. Vaciamos antes de CADA test para que cada uno arranque de cero.
beforeEach(() => {
  limpiar();
});

describe("POST /tareas", () => {
  it("crea una tarea y responde 201 con la tarea creada", async () => {
    const respuesta = await request(app)
      .post("/tareas")
      .send({ titulo: "Comprar café", prioridad: "alta" });

    expect(respuesta.status).toBe(201);
    // toMatchObject: el body contiene al menos estos campos (además del id).
    expect(respuesta.body).toMatchObject({
      titulo: "Comprar café",
      prioridad: "alta",
    });
    expect(respuesta.body.id).toBeDefined();
  });

  it("responde 400 (no 500) si el JSON del body está mal formado", async () => {
  const respuesta = await request(app)
    .post("/tareas")
    .set("Content-Type", "application/json")
    .send("{titulo: bad json");

  expect(respuesta.status).toBe(400);
  });

  it("responde 400 si el título está vacío", async () => {
    const respuesta = await request(app)
      .post("/tareas")
      .send({ titulo: "", prioridad: "alta" });

    expect(respuesta.status).toBe(400);
  });

  it("responde 400 si la prioridad no es válida", async () => {
    const respuesta = await request(app)
      .post("/tareas")
      .send({ titulo: "Tarea válida", prioridad: "urgentísima" });

    expect(respuesta.status).toBe(400);
  });
});

describe("GET /tareas", () => {
  it("devuelve un array vacío cuando no hay tareas", async () => {
    const respuesta = await request(app).get("/tareas");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  it("devuelve todas las tareas cuando hay varias", async () => {
    await request(app).post("/tareas").send({ titulo: "Tarea 1", prioridad: "baja" });
    await request(app).post("/tareas").send({ titulo: "Tarea 2", prioridad: "media" });

    const respuesta = await request(app).get("/tareas");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(2);
  });
});

describe("GET /tareas/:id", () => {
  it("devuelve la tarea cuando el id existe", async () => {
    // Creamos una y usamos el id que devolvió el POST.
    const creada = await request(app)
      .post("/tareas")
      .send({ titulo: "Buscarme", prioridad: "media" });

    const respuesta = await request(app).get(`/tareas/${creada.body.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.id).toBe(creada.body.id);
  });

  it("responde 404 cuando el id no existe", async () => {
    const respuesta = await request(app).get("/tareas/9999");

    expect(respuesta.status).toBe(404);
  });
});
