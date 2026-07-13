// ============================================================
// Tipos
// ============================================================

export interface Vehiculo {
  id: string;
  tipo: 'bicicleta' | 'scooter' | 'patineta';
  /** No aplica a 'bicicleta'. */
  bateriaPct?: number;
}

export type Membresia = 'basica' | 'premium' | 'corporativa';

export interface Usuario {
  id: string;
  nombre: string;
  membresia: Membresia;
  /** Solo tiene sentido para 'corporativa'. */
  empresaId?: string;
}

export interface Reserva {
  id: string;
  vehiculoId: string;
  usuarioId: string;
  minutos: number;
  /** Llega crudo del formulario legacy: puede ser cualquier cosa. */
  codigoPromo: unknown;
}

export interface TarifaBase {
  precioPorMinuto: number;
}

export type TarifaConSurge = TarifaBase & {
  multiplicadorSurge: number;
};

export type Tarifa = TarifaBase | TarifaConSurge;

export type CodigoPromo = 'BLACK10' | 'SUMMER15';

// ============================================================
// Errores
// ============================================================
//
// Elección: throw (no un tipo Resultado).
//
// Que `reserva.vehiculoId` no coincida con `vehiculo.id` no es un caso de
// negocio esperable: es una violación de invariante, o sea un bug del
// caller que armó mal la llamada o una corrupción de datos. Un tipo
// Resultado obligaría a *todos* los call sites a manejar un error que
// nunca debería ocurrir en producción, y peor: los invitaría a ignorarlo.
// Un throw hace ruido fuerte y temprano, que es exactamente lo que querés
// para un bug. (En cambio, para `codigoPromo` inválido —que sí es un input
// del mundo real, esperable y frecuente— no tiramos nada: lo ignoramos.)

export class RelacionInvalidaError extends Error {}

export class VehiculoNoCoincideError extends RelacionInvalidaError {
  constructor(esperado: string, recibido: string) {
    super(
      `La reserva referencia el vehículo '${esperado}' pero se pasó el vehículo '${recibido}'.`,
    );
    this.name = 'VehiculoNoCoincideError';
  }
}

export class UsuarioNoCoincideError extends RelacionInvalidaError {
  constructor(esperado: string, recibido: string) {
    super(
      `La reserva referencia el usuario '${esperado}' pero se pasó el usuario '${recibido}'.`,
    );
    this.name = 'UsuarioNoCoincideError';
  }
}

// ============================================================
// Promos
// ============================================================

const DESCUENTOS_PROMO: Record<CodigoPromo, number> = {
  BLACK10: 0.1,
  SUMMER15: 0.15,
};

/**
 * Type guard sobre el input crudo del formulario legacy.
 *
 * Decisión sobre minúsculas ('black10'):
 * SÍ lo normalizamos (trim + toUpperCase) antes de comparar. El casing y los
 * espacios al borde son un artefacto del formulario viejo (inputs sin
 * `text-transform`, copy/paste desde un mail), no una señal de corrupción:
 * la intención del usuario es inequívoca y rechazarlo solo genera tickets de
 * soporte por un cupón que "no funciona". Lo que NO hacemos es fuzzy matching
 * (typos, guiones, sufijos): ahí sí la intención deja de ser clara y el código
 * se rechaza.
 */
export function esCodigoPromoValido(x: unknown): x is CodigoPromo {
  if (typeof x !== 'string') return false;
  const normalizado = x.trim().toUpperCase();
  return normalizado === 'BLACK10' || normalizado === 'SUMMER15';
}

/** Normaliza un código ya validado a su forma canónica. */
function canonizar(codigo: CodigoPromo | string): CodigoPromo {
  return codigo.trim().toUpperCase() as CodigoPromo;
}

// ============================================================
// Membresías
// ============================================================
//
// Centralizado en UNA función con un switch cerrado por `never`, en vez de
// dispersar `if (membresia === 'premium')` por el código. Si mañana alguien
// agrega 'estudiantil' al union y no toca este switch, TS falla en compilación
// en vez de devolver 0% de descuento en silencio.

const DESCUENTOS_EMPRESA: Readonly<Record<string, number>> = {
  'acme-gt': 0.25,
  globex: 0.3,
  initech: 0.15,
};

const DESCUENTO_CORPORATIVO_DEFAULT = 0.1;

export function descuentoPorMembresia(usuario: Usuario): number {
  switch (usuario.membresia) {
    case 'basica':
      return 0;
    case 'premium':
      return 0.2;
    case 'corporativa': {
      const empresa = usuario.empresaId;
      if (empresa === undefined) return DESCUENTO_CORPORATIVO_DEFAULT;
      return DESCUENTOS_EMPRESA[empresa] ?? DESCUENTO_CORPORATIVO_DEFAULT;
    }
    default: {
      const _exhaustivo: never = usuario.membresia;
      return _exhaustivo;
    }
  }
}

// ============================================================
// Cálculo
// ============================================================

export function calcularCostoFinal(
  reserva: Reserva,
  vehiculo: Vehiculo,
  usuario: Usuario,
  tarifa: Tarifa,
): number {
  // Las dos relaciones se validan por separado: son dos fallas distintas.
  if (reserva.vehiculoId !== vehiculo.id) {
    throw new VehiculoNoCoincideError(reserva.vehiculoId, vehiculo.id);
  }
  if (reserva.usuarioId !== usuario.id) {
    throw new UsuarioNoCoincideError(reserva.usuarioId, usuario.id);
  }

  let costo = tarifa.precioPorMinuto * reserva.minutos;

  // Narrowing de la unión con el operador `in`: acá adentro TS ya sabe
  // que `tarifa` es TarifaConSurge.
  if ('multiplicadorSurge' in tarifa) {
    costo *= tarifa.multiplicadorSurge;
  }

  costo *= 1 - descuentoPorMembresia(usuario);

  // Los descuentos se componen multiplicativamente: premium + BLACK10 sobre
  // 100 da 100 * 0.8 * 0.9 = 72, no 100 * (1 - 0.3) = 70.
  if (esCodigoPromoValido(reserva.codigoPromo)) {
    costo *= 1 - DESCUENTOS_PROMO[canonizar(reserva.codigoPromo)];
  }

  return costo;
}

// ============================================================
// Recibo (overloads)
// ============================================================

export function formatearRecibo(reserva: Reserva, costoFinal: number): string;
export function formatearRecibo(costoFinal: number, moneda: string): string;
export function formatearRecibo(
  a: Reserva | number,
  b: number | string,
): string {
  if (typeof a === 'number') {
    const moneda: string = typeof b === 'string' ? b : String(b);
    return `Recibo\nTotal: ${a.toFixed(2)} ${moneda}`;
  }

  const costoFinal: number = typeof b === 'number' ? b : Number(b);
  return [
    `Recibo de la reserva ${a.id}`,
    `Minutos: ${a.minutos}`,
    `Total: ${costoFinal.toFixed(2)}`,
  ].join('\n');
}