import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';

let app: Express;
beforeEach(() => {
  app = createApp();
});

describe('errorHandler', () => {
  it('responde 400 (no 500) si el JSON del body está mal formado', async () => {
    const res = await request(app)
      .post('/productos')
      .set('Content-Type', 'application/json')
      .send('{nombre: bad json');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('responde 404 JSON controlado para una ruta desconocida', async () => {
    const res = await request(app).get('/no-existe');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
