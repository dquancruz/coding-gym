import { randomUUID } from 'node:crypto';
import type { Producto } from '../domain.js';

/**
 * Repository de productos: SOLO persistencia en memoria. No sabe qué es HTTP ni
 * conoce reglas de negocio de reservas; lo único "de negocio" que protege son
 * las invariantes estructurales del propio stock (nunca negativo, nunca por
 * encima del total), porque eso es integridad del dato, no política.
 */
export class ProductosRepository {
  private readonly productos = new Map<string, Producto>();

  crear(datos: { nombre: string; stockTotal: number }): Producto {
    const producto: Producto = {
      id: randomUUID(),
      nombre: datos.nombre,
      stockTotal: datos.stockTotal,
      stockReservado: 0,
    };
    this.productos.set(producto.id, producto);
    return producto;
  }

  buscarPorId(id: string): Producto | undefined {
    return this.productos.get(id);
  }

  /**
   * Ajusta el stock reservado de un producto en `delta` (positivo al reservar,
   * negativo al liberar). Valida las invariantes ANTES de escribir: si el
   * ajuste dejaría `stockReservado` negativo o por encima de `stockTotal`,
   * lanza en vez de guardar un estado corrupto. Un service correcto nunca
   * debería disparar esto; es la última línea de defensa contra un bug.
   */
  ajustarReservado(id: string, delta: number): Producto {
    const producto = this.productos.get(id);
    if (!producto) {
      throw new Error(`Producto inexistente al ajustar stock: ${id}`);
    }
    const nuevo = producto.stockReservado + delta;
    if (nuevo < 0 || nuevo > producto.stockTotal) {
      throw new Error(
        `Invariante de stock violada para ${id}: stockReservado=${nuevo}, ` +
          `stockTotal=${producto.stockTotal}`,
      );
    }
    producto.stockReservado = nuevo;
    return producto;
  }
}
