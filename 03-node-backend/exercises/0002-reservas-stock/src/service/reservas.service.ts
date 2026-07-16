import { ConflictError, NotFoundError } from '../errors/AppError.js';
import type { Reserva } from '../domain.js';
import type { ProductosRepository } from '../repository/productos.repository.js';
import type { ReservasRepository } from '../repository/reservas.repository.js';

/**
 * Reglas de negocio de reservas. Es el punto donde se cruza el estado entre
 * `producto` y `reserva`, así que depende de AMBOS repositories. No conoce
 * `req`/`res`.
 */
export class ReservasService {
  constructor(
    private readonly reservasRepo: ReservasRepository,
    private readonly productosRepo: ProductosRepository,
  ) {}

  crear(datos: { productoId: string; cantidad: number }): Reserva {
    const producto = this.productosRepo.buscarPorId(datos.productoId);
    if (!producto) {
      // El producto referenciado no existe -> 404, no 400: el body tenía
      // formato válido, lo que falla es a qué apunta.
      throw new NotFoundError(
        `No existe un producto con id ${datos.productoId}`,
      );
    }

    // REGLA DE NEGOCIO (no es formato -> no va en Zod): no se puede reservar
    // más de lo disponible AHORA. `stockDisponible` se calcula en el momento.
    //
    // CONDICIÓN DE CARRERA (ver README, stretch): entre este "leer disponible"
    // y el "ajustarReservado" de abajo hay un check-then-act. En Node de un solo
    // proceso el event loop lo mantiene atómico (no hay await en el medio). Con
    // varios procesos o instancias contra una DB real, dos requests podrían leer
    // el mismo disponible y ambas reservar la última unidad -> oversell. Se
    // resuelve en la DB (ver README): UPDATE condicional atómico, SELECT ...
    // FOR UPDATE, o un CHECK constraint sobre stockReservado <= stockTotal.
    const stockDisponible = producto.stockTotal - producto.stockReservado;
    if (datos.cantidad > stockDisponible) {
      throw new ConflictError(
        `Stock insuficiente para el producto ${producto.id}: ` +
          `pedido ${datos.cantidad}, disponible ${stockDisponible}`,
      );
    }

    // Orden importante: primero ajustamos el reservado (que valida invariantes)
    // y recién después creamos la reserva, para no dejar una reserva "huérfana"
    // si el ajuste fallara.
    this.productosRepo.ajustarReservado(producto.id, datos.cantidad);
    const reserva = this.reservasRepo.crear(datos);
    return { ...reserva };
  }

  obtener(id: string): Reserva {
    const reserva = this.reservasRepo.buscarPorId(id);
    if (!reserva) {
      throw new NotFoundError(`No existe una reserva con id ${id}`);
    }
    // Copia defensiva: quien llama no debe poder mutar el estado interno del
    // repository escribiendo directamente sobre el objeto devuelto (mismo
    // principio que `toProductoView` ya aplica para productos).
    return { ...reserva };
  }

  /**
   * Cancela una reserva y devuelve su cantidad al stock disponible del producto
   * al que pertenece (nunca a otro: usamos `reserva.productoId`, no un match
   * por cantidad).
   *
   * DECISIÓN sobre doble cancelación: es un NO-OP IDEMPOTENTE. Si la reserva ya
   * está cancelada, devolvemos la reserva tal cual SIN volver a tocar el stock.
   * Elegimos idempotencia porque DELETE es idempotente por semántica HTTP: el
   * cliente que reintenta debe ver el mismo resultado, no un 404 ni un doble
   * descuento. Lo único inaceptable —liberar el stock dos veces— queda
   * bloqueado por el `return` temprano.
   */
  cancelar(id: string): Reserva {
    const reserva = this.reservasRepo.buscarPorId(id);
    if (!reserva) {
      throw new NotFoundError(`No existe una reserva con id ${id}`);
    }

    if (reserva.estado === 'cancelada') {
      return { ...reserva }; // no-op idempotente: NO se libera stock otra vez
    }

    this.productosRepo.ajustarReservado(reserva.productoId, -reserva.cantidad);
    reserva.estado = 'cancelada';
    const guardada = this.reservasRepo.guardar(reserva);
    return { ...guardada };
  }

  /** Stretch: reservas activas de un producto (404 si el producto no existe). */
  listarActivasPorProducto(productoId: string): Reserva[] {
    const producto = this.productosRepo.buscarPorId(productoId);
    if (!producto) {
      throw new NotFoundError(`No existe un producto con id ${productoId}`);
    }
    return this.reservasRepo
      .listarActivasPorProducto(productoId)
      .map((r) => ({ ...r }));
  }
}
