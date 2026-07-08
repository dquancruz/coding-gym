import { z } from "zod";

// Schema del pedido entrante. La forma real del dato se define acá una sola
// vez; el tipo TypeScript se deriva más abajo con z.infer (sin duplicar).
export const pedidoSchema = z.object({
  id: z.string().min(1, "no puede estar vacío"),

  clienteEmail: z.email("debe ser un email válido"),

  items: z
    .array(
      z.object({
        sku: z.string().min(1, "no puede estar vacío"),
        cantidad: z
          .number()
          .int("debe ser un número entero")
          .positive("debe ser un número positivo"),
      }),
    )
    .min(1, "debe tener al menos un elemento"),

  total: z.number().positive("debe ser un número positivo"),

  // Enum de Zod: sólo estos tres valores son válidos, no un string libre.
  moneda: z.enum(["USD", "ARS", "EUR"]),
});

// El tipo sale del schema. Si el schema cambia, el tipo cambia solo.
export type Pedido = z.infer<typeof pedidoSchema>;

// Resultado explícito: el llamador SIEMPRE recibe uno de estos dos, nunca
// una excepción.
export type ResultadoProcesar =
  | { ok: true; pedido: Pedido }
  | { ok: false; errores: string[] };

/**
 * Valida un payload desconocido contra el schema y lo procesa sólo si es
 * válido. Nunca lanza (throw) por un payload inválido: usa safeParse, no parse.
 */
export function procesarPedido(payload: unknown): ResultadoProcesar {
  const resultado = pedidoSchema.safeParse(payload);

  if (resultado.success) {
    return { ok: true, pedido: resultado.data };
  }

  // error.issues es un array; cada issue tiene .path (dónde falló) y .message
  // (por qué). Lo convertimos a strings legibles tipo "items.0.cantidad: ...".
  const errores = resultado.error.issues.map((issue) => {
    const ruta = issue.path.join(".");
    return ruta ? `${ruta}: ${issue.message}` : issue.message;
  });

  return { ok: false, errores };
}

// Nota sobre el stretch goal (total ≈ suma de cantidades): no es validable con
// este payload. Los items sólo traen `sku` y `cantidad`, no un precio unitario,
// así que no hay forma de reconstruir el total esperado. Con un campo
// `precioUnitario` por item se haría con un .refine() sobre el objeto completo:
//
//   .refine(
//     (p) => Math.abs(p.total - p.items.reduce(
//       (acc, it) => acc + it.cantidad * it.precioUnitario, 0)) < 0.01,
//     { message: "total no coincide con la suma de los items", path: ["total"] },
//   )