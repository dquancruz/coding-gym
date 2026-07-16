import { describe, it, expect } from 'vitest';
import { ProductosRepository } from '../src/repository/productos.repository.js';
import { ReservasRepository } from '../src/repository/reservas.repository.js';
import { ReservasService } from '../src/service/reservas.service.js';

describe('ReservasService — copia defensiva', () => {
  it('mutar el objeto devuelto por obtener() no corrompe el estado interno', () => {
    const productosRepo = new ProductosRepository();
    const reservasRepo = new ReservasRepository();
    const service = new ReservasService(reservasRepo, productosRepo);

    const producto = productosRepo.crear({ nombre: 'X', stockTotal: 10 });
    const reserva = service.crear({ productoId: producto.id, cantidad: 3 });

    const leida = service.obtener(reserva.id);
    leida.estado = 'cancelada';
    leida.cantidad = 999;

    const releida = service.obtener(reserva.id);
    expect(releida.estado).toBe('activa');
    expect(releida.cantidad).toBe(3);
    expect(productosRepo.buscarPorId(producto.id)?.stockReservado).toBe(3);
  });
});
