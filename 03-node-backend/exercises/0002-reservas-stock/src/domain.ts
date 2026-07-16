/**
 * Modelo de dominio. `stockDisponible` NO se guarda: es un dato derivado
 * (`stockTotal - stockReservado`) que se calcula al momento de leer, para que
 * nunca pueda quedar "desincronizado" respecto de las reservas reales.
 */

export type EstadoReserva = 'activa' | 'cancelada';

/** Cómo se guarda el producto internamente (con el contador de reservado). */
export interface Producto {
  id: string;
  nombre: string;
  stockTotal: number;
  stockReservado: number;
}

/** Cómo se le muestra el producto al cliente (con el disponible calculado). */
export interface ProductoView {
  id: string;
  nombre: string;
  stockTotal: number;
  stockReservado: number;
  stockDisponible: number;
}

export interface Reserva {
  id: string;
  productoId: string;
  cantidad: number;
  estado: EstadoReserva;
}

export function toProductoView(p: Producto): ProductoView {
  return {
    id: p.id,
    nombre: p.nombre,
    stockTotal: p.stockTotal,
    stockReservado: p.stockReservado,
    stockDisponible: p.stockTotal - p.stockReservado,
  };
}
