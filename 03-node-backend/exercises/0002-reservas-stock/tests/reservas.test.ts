import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';

let app: Express;
beforeEach(() => {
  app = createApp();
});

/** Helper: crea un producto y devuelve su id. */
async function crearProducto(nombre: string, stockTotal: number): Promise<string> {
  const res = await request(app).post('/productos').send({ nombre, stockTotal });
  expect(res.status).toBe(201);
  return res.body.id as string;
}

/** Helper: lee el stockDisponible actual de un producto. */
async function stockDisponible(productoId: string): Promise<number> {
  const res = await request(app).get(`/productos/${productoId}`);
  expect(res.status).toBe(200);
  return res.body.stockDisponible as number;
}

describe('POST /reservas', () => {
  it('crea una reserva exitosa (201) y baja el stock disponible', async () => {
    const productoId = await crearProducto('Silla', 10);

    const res = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 4 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      productoId,
      cantidad: 4,
      estado: 'activa',
    });
    expect(typeof res.body.id).toBe('string');

    expect(await stockDisponible(productoId)).toBe(6);
  });

  it('rechaza con 409 si cantidad > stock disponible (regla de negocio)', async () => {
    const productoId = await crearProducto('Silla', 3);

    const res = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 5 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
    // el estado no debe haberse tocado
    expect(await stockDisponible(productoId)).toBe(3);
  });

  it('permite reservar exactamente el disponible, pero no una unidad más', async () => {
    const productoId = await crearProducto('Silla', 2);

    const ok = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 2 });
    expect(ok.status).toBe(201);
    expect(await stockDisponible(productoId)).toBe(0);

    const excede = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 1 });
    expect(excede.status).toBe(409);
  });

  it('devuelve 404 si el productoId no existe', async () => {
    const res = await request(app)
      .post('/reservas')
      .send({ productoId: 'no-existe', cantidad: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('rechaza cantidad 0 con 400', async () => {
    const productoId = await crearProducto('Silla', 10);
    const res = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rechaza cantidad negativa con 400', async () => {
    const productoId = await crearProducto('Silla', 10);
    const res = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: -2 });
    expect(res.status).toBe(400);
  });

  it('rechaza cantidad no entera con 400', async () => {
    const productoId = await crearProducto('Silla', 10);
    const res = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 1.5 });
    expect(res.status).toBe(400);
  });
});

describe('GET /reservas/:id', () => {
  it('devuelve la reserva por id', async () => {
    const productoId = await crearProducto('Mesa', 5);
    const creada = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 2 });

    const res = await request(app).get(`/reservas/${creada.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(creada.body.id);
  });

  it('devuelve 404 si la reserva no existe', async () => {
    const res = await request(app).get('/reservas/no-existe');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /reservas/:id', () => {
  it('cancela una reserva activa y devuelve el stock al producto', async () => {
    const productoId = await crearProducto('Lámpara', 10);
    const reserva = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 4 });
    expect(await stockDisponible(productoId)).toBe(6);

    const res = await request(app).delete(`/reservas/${reserva.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('cancelada');

    expect(await stockDisponible(productoId)).toBe(10); // stock devuelto
  });

  it('devuelve 404 al cancelar una reserva inexistente', async () => {
    const res = await request(app).delete('/reservas/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('la doble cancelación es idempotente y NO libera stock dos veces', async () => {
    const productoId = await crearProducto('Ventilador', 10);
    const reserva = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 4 });

    const primera = await request(app).delete(`/reservas/${reserva.body.id}`);
    expect(primera.status).toBe(200);
    expect(await stockDisponible(productoId)).toBe(10);

    // segunda cancelación: mismo resultado, sin doble liberación
    const segunda = await request(app).delete(`/reservas/${reserva.body.id}`);
    expect(segunda.status).toBe(200);
    expect(segunda.body.estado).toBe('cancelada');
    expect(await stockDisponible(productoId)).toBe(10); // NO subió a 14
  });

  it('cancelar la reserva de un producto NO afecta el stock de otro producto con la misma cantidad', async () => {
    // dos productos distintos, cada uno con una reserva de la MISMA cantidad
    const productoA = await crearProducto('Producto A', 10);
    const productoB = await crearProducto('Producto B', 10);

    const reservaA = await request(app)
      .post('/reservas')
      .send({ productoId: productoA, cantidad: 3 });
    await request(app)
      .post('/reservas')
      .send({ productoId: productoB, cantidad: 3 });

    expect(await stockDisponible(productoA)).toBe(7);
    expect(await stockDisponible(productoB)).toBe(7);

    // cancelamos SOLO la de A
    const res = await request(app).delete(`/reservas/${reservaA.body.id}`);
    expect(res.status).toBe(200);

    expect(await stockDisponible(productoA)).toBe(10); // A recupera
    expect(await stockDisponible(productoB)).toBe(7); // B intacto
  });

  it('tras cancelar, el stock liberado se puede volver a reservar', async () => {
    const productoId = await crearProducto('Cargador', 5);
    const reserva = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 5 });
    expect(await stockDisponible(productoId)).toBe(0);

    await request(app).delete(`/reservas/${reserva.body.id}`);
    expect(await stockDisponible(productoId)).toBe(5);

    const denuevo = await request(app)
      .post('/reservas')
      .send({ productoId, cantidad: 5 });
    expect(denuevo.status).toBe(201);
    expect(await stockDisponible(productoId)).toBe(0);
  });
});
