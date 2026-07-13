import { describe, it, expect } from 'vitest';
import {
  calcularCostoFinal,
  esCodigoPromoValido,
  formatearRecibo,
  UsuarioNoCoincideError,
  VehiculoNoCoincideError,
  type Reserva,
  type TarifaBase,
  type TarifaConSurge,
  type Usuario,
  type Vehiculo,
} from '../src/tarifas';

// ============================================================
// Fixtures
// ============================================================

const vehiculo: Vehiculo = { id: 'v1', tipo: 'scooter', bateriaPct: 82 };

const basico: Usuario = { id: 'u1', nombre: 'Ana', membresia: 'basica' };
const premium: Usuario = { id: 'u1', nombre: 'Ana', membresia: 'premium' };

const tarifa: TarifaBase = { precioPorMinuto: 2 };
const tarifaSurge: TarifaConSurge = { precioPorMinuto: 2, multiplicadorSurge: 1.5 };

function reserva(codigoPromo: unknown = undefined): Reserva {
  return { id: 'r1', vehiculoId: 'v1', usuarioId: 'u1', minutos: 10, codigoPromo };
}

describe('calcularCostoFinal', () => {
  // ============================================================
  // Camino feliz
  // ============================================================

  it('sin surge, sin promo, membresía básica', () => {
    expect(calcularCostoFinal(reserva(), vehiculo, basico, tarifa)).toBe(20);
  });

  it('surge aplicado', () => {
    expect(calcularCostoFinal(reserva(), vehiculo, basico, tarifaSurge)).toBe(30);
  });

  it('descuento premium aplicado (sin surge)', () => {
    expect(calcularCostoFinal(reserva(), vehiculo, premium, tarifa)).toBe(16);
  });

  it('surge + premium se componen', () => {
    expect(calcularCostoFinal(reserva(), vehiculo, premium, tarifaSurge)).toBe(24);
  });

  // ============================================================
  // Membresía corporativa
  // ============================================================

  it('corporativa con empresa conocida usa su descuento', () => {
    const corp: Usuario = {
      id: 'u1',
      nombre: 'Ana',
      membresia: 'corporativa',
      empresaId: 'globex',
    };
    expect(calcularCostoFinal(reserva(), vehiculo, corp, tarifa)).toBe(14);
  });

  it('corporativa sin empresa cae al descuento default', () => {
    const corp: Usuario = { id: 'u1', nombre: 'Ana', membresia: 'corporativa' };
    expect(calcularCostoFinal(reserva(), vehiculo, corp, tarifa)).toBe(18);
  });

  it('corporativa con empresa desconocida cae al default', () => {
    const corp: Usuario = {
      id: 'u1',
      nombre: 'Ana',
      membresia: 'corporativa',
      empresaId: 'empresa-fantasma',
    };
    expect(calcularCostoFinal(reserva(), vehiculo, corp, tarifa)).toBe(18);
  });

  // ============================================================
  // Promos válidas
  // ============================================================

  it("codigoPromo 'BLACK10' descuenta 10%", () => {
    expect(calcularCostoFinal(reserva('BLACK10'), vehiculo, basico, tarifa)).toBe(18);
  });

  it("codigoPromo 'SUMMER15' descuenta 15%", () => {
    expect(calcularCostoFinal(reserva('SUMMER15'), vehiculo, basico, tarifa)).toBe(17);
  });

  it('promo se compone con el descuento premium (multiplicativo)', () => {
    expect(calcularCostoFinal(reserva('BLACK10'), vehiculo, premium, tarifa)).toBe(14.4);
  });

  it('minúsculas y espacios se normalizan', () => {
    expect(calcularCostoFinal(reserva('  black10 '), vehiculo, basico, tarifa)).toBe(18);
  });

  // ============================================================
  // Promos basura: se ignoran, nunca lanzan
  // ============================================================

  const basura: unknown[] = [
    undefined,
    null,
    42,
    0,
    NaN,
    'BLACK11',
    'BLACK10 EXTRA',
    '',
    {},
    { codigo: 'BLACK10' },
    ['BLACK10'],
    true,
  ];

  it.each(basura)('codigoPromo inválido se ignora: %s', (valor) => {
    expect(() => calcularCostoFinal(reserva(valor), vehiculo, basico, tarifa)).not.toThrow();
    expect(calcularCostoFinal(reserva(valor), vehiculo, basico, tarifa)).toBe(20);
  });

  // ============================================================
  // Relaciones inválidas (dos casos separados)
  // ============================================================

  it('vehiculoId que no coincide -> falla explícita', () => {
    const otroVehiculo: Vehiculo = { id: 'v999', tipo: 'bicicleta' };
    expect(() => calcularCostoFinal(reserva(), otroVehiculo, basico, tarifa)).toThrow(
      VehiculoNoCoincideError,
    );
  });

  it('usuarioId que no coincide -> falla explícita', () => {
    const otroUsuario: Usuario = { id: 'u999', nombre: 'Beto', membresia: 'basica' };
    expect(() => calcularCostoFinal(reserva(), vehiculo, otroUsuario, tarifa)).toThrow(
      UsuarioNoCoincideError,
    );
  });
});

describe('esCodigoPromoValido', () => {
  it('el type guard rechaza no-strings y strings que no matchean', () => {
    expect(esCodigoPromoValido('BLACK10')).toBe(true);
    expect(esCodigoPromoValido('summer15')).toBe(true);
    expect(esCodigoPromoValido('BLACK')).toBe(false);
    expect(esCodigoPromoValido(10)).toBe(false);
    expect(esCodigoPromoValido(undefined)).toBe(false);
  });
});

describe('formatearRecibo', () => {
  it('formatearRecibo(reserva, costo) incluye el id de la reserva', () => {
    const salida = formatearRecibo(reserva(), 20);
    expect(salida).toContain('r1');
    expect(salida).toContain('20.00');
  });

  it('formatearRecibo(costo, moneda) no incluye id de reserva', () => {
    const salida = formatearRecibo(20, 'GTQ');
    expect(salida).toContain('20.00 GTQ');
    expect(salida).not.toContain('r1');
  });
});
