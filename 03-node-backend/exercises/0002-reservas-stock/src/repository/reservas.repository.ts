import { randomUUID } from 'node:crypto';
import type { Reserva } from '../domain.js';

/**
 * Repository de reservas: SOLO persistencia en memoria. Genera el id, guarda y
 * recupera. Toda la coordinación con el producto (validar stock, ajustar
 * reservado) vive en el service, no acá.
 */
export class ReservasRepository {
  private readonly reservas = new Map<string, Reserva>();

  crear(datos: { productoId: string; cantidad: number }): Reserva {
    const reserva: Reserva = {
      id: randomUUID(),
      productoId: datos.productoId,
      cantidad: datos.cantidad,
      estado: 'activa',
    };
    this.reservas.set(reserva.id, reserva);
    return reserva;
  }

  buscarPorId(id: string): Reserva | undefined {
    return this.reservas.get(id);
  }

  /** Reservas activas de un producto (para el stretch de listado). */
  listarActivasPorProducto(productoId: string): Reserva[] {
    return [...this.reservas.values()].filter(
      (r) => r.productoId === productoId && r.estado === 'activa',
    );
  }

  guardar(reserva: Reserva): Reserva {
    this.reservas.set(reserva.id, reserva);
    return reserva;
  }
}
