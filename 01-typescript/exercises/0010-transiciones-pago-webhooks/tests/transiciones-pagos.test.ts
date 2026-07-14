import { describe, it, expect } from 'vitest'; // o el runner que uses
import {
  parsearEventoGateway,
  aplicarEvento,
  canTransition,
  type EstadoPago,
  type EventoGateway,
  type Resultado,
} from '../src/transiciones-pagos';

const EN = new Date('2026-01-15T10:00:00Z');

// Helper: desenvuelve un Resultado ok, falla el test si es error.
function debeSerOk(r: Resultado<EstadoPago>): EstadoPago {
  if (!r.ok) throw new Error(`Esperaba ok, obtuve error: ${r.motivo}`);
  return r.valor;
}

const CREADO: EstadoPago = { status: 'creado' };

const autorizar = (monto: number): EventoGateway => ({
  type: 'autorizacion_exitosa',
  authCode: 'AUTH-123',
  monto,
  en: EN,
});
const capturar = (monto: number): EventoGateway => ({
  type: 'captura_exitosa',
  monto,
  en: EN,
});
const reembolsar = (monto: number): EventoGateway => ({
  type: 'reembolso_emitido',
  monto,
  en: EN,
});

describe('aplicarEvento — camino feliz', () => {
  it('creado → autorizado → capturado → reembolsado (total en un evento)', () => {
    const autorizado = debeSerOk(aplicarEvento(CREADO, autorizar(1000)));
    expect(autorizado.status).toBe('autorizado');

    const capturado = debeSerOk(aplicarEvento(autorizado, capturar(1000)));
    expect(capturado.status).toBe('capturado');

    const reembolsado = debeSerOk(aplicarEvento(capturado, reembolsar(1000)));
    expect(reembolsado.status).toBe('reembolsado');
    if (reembolsado.status !== 'reembolsado') throw new Error('narrowing');
    expect(reembolsado.montoReembolsado).toBe(1000);
    expect(reembolsado.reembolsos).toHaveLength(1);
  });

  it('dos reembolsos parciales que suman el total → reembolsado', () => {
    const autorizado = debeSerOk(aplicarEvento(CREADO, autorizar(1000)));
    const capturado = debeSerOk(aplicarEvento(autorizado, capturar(1000)));

    const parcial = debeSerOk(aplicarEvento(capturado, reembolsar(400)));
    expect(parcial.status).toBe('parcialmente_reembolsado');

    const total = debeSerOk(aplicarEvento(parcial, reembolsar(600)));
    expect(total.status).toBe('reembolsado');
    if (total.status !== 'reembolsado') throw new Error('narrowing');
    expect(total.montoReembolsado).toBe(1000);
    expect(total.reembolsos).toHaveLength(2);
  });

  it('reembolso parcial que no llega al total → parcialmente_reembolsado', () => {
    const autorizado = debeSerOk(aplicarEvento(CREADO, autorizar(1000)));
    const capturado = debeSerOk(aplicarEvento(autorizado, capturar(1000)));
    const parcial = debeSerOk(aplicarEvento(capturado, reembolsar(300)));

    expect(parcial.status).toBe('parcialmente_reembolsado');
    if (parcial.status !== 'parcialmente_reembolsado') throw new Error('narrowing');
    expect(parcial.montoReembolsado).toBe(300);
    expect(parcial.montoCapturado).toBe(1000);
  });
});

describe('aplicarEvento — transiciones inválidas', () => {
  it('no se puede capturar sin autorización previa', () => {
    const r = aplicarEvento(CREADO, capturar(500));
    expect(r.ok).toBe(false);
  });

  it('no se puede reembolsar más de lo capturado (un solo evento)', () => {
    const autorizado = debeSerOk(aplicarEvento(CREADO, autorizar(1000)));
    const capturado = debeSerOk(aplicarEvento(autorizado, capturar(1000)));

    const r = aplicarEvento(capturado, reembolsar(1500));
    expect(r.ok).toBe(false);
  });

  it('no se puede reembolsar más de lo capturado (acumulado) — EL INCIDENTE', () => {
    const autorizado = debeSerOk(aplicarEvento(CREADO, autorizar(1000)));
    const capturado = debeSerOk(aplicarEvento(autorizado, capturar(1000)));
    const parcial = debeSerOk(aplicarEvento(capturado, reembolsar(700)));

    const r = aplicarEvento(parcial, reembolsar(500)); // 700 + 500 > 1000
    expect(r.ok).toBe(false);
    if (r.ok) throw new Error('narrowing');
    expect(r.motivo).toContain('excede');
  });

  it('pago fallido es terminal', () => {
    const fallido = debeSerOk(
      aplicarEvento(CREADO, {
        type: 'autorizacion_fallida',
        motivo: 'fondos insuficientes',
        en: EN,
      }),
    );
    expect(fallido.status).toBe('fallido');

    expect(aplicarEvento(fallido, autorizar(100)).ok).toBe(false);
    expect(aplicarEvento(fallido, capturar(100)).ok).toBe(false);
    expect(aplicarEvento(fallido, reembolsar(100)).ok).toBe(false);
  });

  it('pago reembolsado es terminal', () => {
    const autorizado = debeSerOk(aplicarEvento(CREADO, autorizar(500)));
    const capturado = debeSerOk(aplicarEvento(autorizado, capturar(500)));
    const reembolsado = debeSerOk(aplicarEvento(capturado, reembolsar(500)));

    expect(aplicarEvento(reembolsado, reembolsar(1)).ok).toBe(false);
    expect(aplicarEvento(reembolsado, capturar(500)).ok).toBe(false);
    expect(aplicarEvento(reembolsado, autorizar(500)).ok).toBe(false);
  });
});

describe('aplicarEvento — evento duplicado (decisión: no-op idempotente)', () => {
  it('captura_exitosa repetida sobre un pago ya capturado → no-op, no error', () => {
    const autorizado = debeSerOk(aplicarEvento(CREADO, autorizar(1000)));
    const capturado = debeSerOk(aplicarEvento(autorizado, capturar(1000)));

    const reintento = aplicarEvento(capturado, capturar(1000));
    expect(reintento.ok).toBe(true);

    const estado = debeSerOk(reintento);
    expect(estado.status).toBe('capturado');
    if (estado.status !== 'capturado') throw new Error('narrowing');
    expect(estado.montoCapturado).toBe(1000); // no se duplicó
  });

  it('reembolso duplicado NO es no-op: se contabiliza, y el invariante lo frena', () => {
    const autorizado = debeSerOk(aplicarEvento(CREADO, autorizar(1000)));
    const capturado = debeSerOk(aplicarEvento(autorizado, capturar(1000)));

    // Dos reembolsos de 600: el segundo llevaría el total a 1200 > 1000.
    const primero = debeSerOk(aplicarEvento(capturado, reembolsar(600)));
    const segundo = aplicarEvento(primero, reembolsar(600));

    expect(segundo.ok).toBe(false); // exactamente lo que falló en producción
  });
});

describe('parsearEventoGateway — basura', () => {
  const basura: unknown[] = [
    null,
    undefined,
    {},
    [],
    42,
    'captura_exitosa',
    { type: 'algo_que_no_existe', monto: 100, en: EN.toISOString() },
    { type: 'reembolso_emitido', monto: '100', en: EN.toISOString() }, // string
    { type: 'reembolso_emitido', monto: 100 }, // falta `en`
    { type: 'reembolso_emitido', monto: 100, en: 'banana' }, // fecha inválida
    { type: 'captura_exitosa', monto: NaN, en: EN.toISOString() },
    { type: 'autorizacion_exitosa', monto: 100, en: EN.toISOString() }, // falta authCode
  ];

  it.each(basura)('devuelve null y no lanza para %p', (payload) => {
    expect(() => parsearEventoGateway(payload)).not.toThrow();
    expect(parsearEventoGateway(payload)).toBeNull();
  });
});

describe('parsearEventoGateway — payloads válidos', () => {
  const iso = EN.toISOString();

  it('autorizacion_exitosa', () => {
    const e = parsearEventoGateway({
      type: 'autorizacion_exitosa',
      authCode: 'AUTH-1',
      monto: 1000,
      en: iso,
    });
    expect(e).toEqual({
      type: 'autorizacion_exitosa',
      authCode: 'AUTH-1',
      monto: 1000,
      en: EN,
    });
  });

  it('autorizacion_fallida', () => {
    const e = parsearEventoGateway({
      type: 'autorizacion_fallida',
      motivo: 'tarjeta vencida',
      en: iso,
    });
    expect(e?.type).toBe('autorizacion_fallida');
  });

  it('captura_exitosa', () => {
    const e = parsearEventoGateway({ type: 'captura_exitosa', monto: 1000, en: iso });
    expect(e).toEqual({ type: 'captura_exitosa', monto: 1000, en: EN });
  });

  it('captura_fallida', () => {
    const e = parsearEventoGateway({
      type: 'captura_fallida',
      motivo: 'timeout del emisor',
      en: iso,
    });
    expect(e?.type).toBe('captura_fallida');
  });

  it('reembolso_emitido', () => {
    const e = parsearEventoGateway({ type: 'reembolso_emitido', monto: 250, en: iso });
    expect(e).toEqual({ type: 'reembolso_emitido', monto: 250, en: EN });
  });

  it('el flujo real: JSON.parse → parsear → aplicar', () => {
    const body = '{"type":"captura_exitosa","monto":1000,"en":"2026-01-15T10:00:00Z"}';
    const evento = parsearEventoGateway(JSON.parse(body));
    expect(evento).not.toBeNull();
    if (evento === null) throw new Error('narrowing');

    const autorizado = debeSerOk(aplicarEvento(CREADO, autorizar(1000)));
    expect(debeSerOk(aplicarEvento(autorizado, evento)).status).toBe('capturado');
  });
});

describe('canTransition', () => {
  it('refleja las reglas de negocio', () => {
    expect(canTransition('creado', 'captura_exitosa')).toBe(false);
    expect(canTransition('autorizado', 'captura_exitosa')).toBe(true);
    expect(canTransition('capturado', 'reembolso_emitido')).toBe(true);
    expect(canTransition('reembolsado', 'reembolso_emitido')).toBe(false);
    expect(canTransition('fallido', 'autorizacion_exitosa')).toBe(false);
  });
});