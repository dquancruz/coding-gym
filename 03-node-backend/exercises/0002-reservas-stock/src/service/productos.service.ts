import { NotFoundError } from '../errors/AppError.js';
import { toProductoView, type ProductoView } from '../domain.js';
import type { ProductosRepository } from '../repository/productos.repository.js';

/**
 * Reglas de negocio de productos. No conoce `req`/`res`: recibe datos ya
 * validados por Zod y devuelve/lanza en términos de dominio.
 */
export class ProductosService {
  constructor(private readonly repo: ProductosRepository) {}

  crear(datos: { nombre: string; stockTotal: number }): ProductoView {
    const producto = this.repo.crear(datos);
    return toProductoView(producto);
  }

  obtener(id: string): ProductoView {
    const producto = this.repo.buscarPorId(id);
    if (!producto) {
      throw new NotFoundError(`No existe un producto con id ${id}`);
    }
    return toProductoView(producto);
  }
}
