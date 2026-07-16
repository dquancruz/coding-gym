import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';

let app: Express;
beforeEach(() => {
  app = createApp(); // estado limpio por test
});

describe('POST /productos', () => {
  it('crea un producto y devuelve 201 con stockDisponible calculado', async () => {
    const res = await request(app)
      .post('/productos')
      .send({ nombre: 'Teclado', stockTotal: 10 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      nombre: 'Teclado',
      stockTotal: 10,
      stockReservado: 0,
      stockDisponible: 10,
    });
    expect(typeof res.body.id).toBe('string');
    expect(res.body.id.length).toBeGreaterThan(0);
  });

  it('rechaza nombre vacío con 400 y no crea nada', async () => {
    const res = await request(app)
      .post('/productos')
      .send({ nombre: '   ', stockTotal: 5 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rechaza stockTotal negativo con 400', async () => {
    const res = await request(app)
      .post('/productos')
      .send({ nombre: 'Mouse', stockTotal: -1 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rechaza stockTotal no entero con 400', async () => {
    const res = await request(app)
      .post('/productos')
      .send({ nombre: 'Mouse', stockTotal: 2.5 });

    expect(res.status).toBe(400);
  });
});

describe('GET /productos/:id', () => {
  it('devuelve el producto con stockDisponible', async () => {
    const creado = await request(app)
      .post('/productos')
      .send({ nombre: 'Monitor', stockTotal: 3 });

    const res = await request(app).get(`/productos/${creado.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.stockDisponible).toBe(3);
  });

  it('devuelve 404 si el producto no existe', async () => {
    const res = await request(app).get('/productos/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /productos/:id/reservas (stretch)', () => {
  it('lista solo las reservas activas del producto', async () => {
    const prod = await request(app)
      .post('/productos')
      .send({ nombre: 'Cámara', stockTotal: 10 });

    const r1 = await request(app)
      .post('/reservas')
      .send({ productoId: prod.body.id, cantidad: 2 });
    await request(app)
      .post('/reservas')
      .send({ productoId: prod.body.id, cantidad: 3 });

    // cancelamos una: no debe aparecer en el listado de activas
    await request(app).delete(`/reservas/${r1.body.id}`);

    const res = await request(app).get(`/productos/${prod.body.id}/reservas`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].cantidad).toBe(3);
  });

  it('devuelve 404 si el producto no existe', async () => {
    const res = await request(app).get('/productos/no-existe/reservas');
    expect(res.status).toBe(404);
  });
});
