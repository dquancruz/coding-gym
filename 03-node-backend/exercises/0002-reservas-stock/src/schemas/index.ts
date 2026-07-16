import { z } from 'zod';

/**
 * Schemas de Zod: SOLO validación de formato (forma del body). Las reglas que
 * dependen del estado del sistema (¿hay stock?, ¿existe el producto?) NO van
 * acá: son de negocio y viven en la capa de service.
 */

export const crearProductoSchema = z.object({
  nombre: z.string().trim().min(1, 'nombre no puede estar vacío'),
  stockTotal: z
    .number({ invalid_type_error: 'stockTotal debe ser un número' })
    .int('stockTotal debe ser entero')
    .min(0, 'stockTotal debe ser >= 0'),
});

export const crearReservaSchema = z.object({
  productoId: z.string().trim().min(1, 'productoId no puede estar vacío'),
  cantidad: z
    .number({ invalid_type_error: 'cantidad debe ser un número' })
    .int('cantidad debe ser entero')
    .positive('cantidad debe ser > 0'),
});

export type CrearProductoInput = z.infer<typeof crearProductoSchema>;
export type CrearReservaInput = z.infer<typeof crearReservaSchema>;
