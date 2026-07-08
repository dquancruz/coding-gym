import { describe, it, expect } from "vitest";
import { procesarPedido } from "../src/validacion-pedidos";

describe("procesarPedido", () => {
  // Base válida que cada test tuerce puntualmente con un spread.
  const pedidoValido = {
    id: "PED-001",
    clienteEmail: "cliente@ejemplo.com",
    items: [
      { sku: "SKU-1", cantidad: 2 },
      { sku: "SKU-2", cantidad: 1 },
    ],
    total: 150.5,
    moneda: "USD",
  };

  it("acepta un payload válido y devuelve el pedido tipado", () => {
    const resultado = procesarPedido(pedidoValido);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      // Dentro de este if, TypeScript sabe que resultado.pedido: Pedido.
      expect(resultado.pedido.id).toBe("PED-001");
      expect(resultado.pedido.moneda).toBe("USD");
      expect(resultado.pedido.items).toHaveLength(2);
    }
  });

  it("rechaza un email inválido", () => {
    const resultado = procesarPedido({
      ...pedidoValido,
      clienteEmail: "no-es-un-email",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(
        resultado.errores.some((e) => e.startsWith("clienteEmail:")),
      ).toBe(true);
    }
  });

  it("rechaza un array de items vacío", () => {
    const resultado = procesarPedido({ ...pedidoValido, items: [] });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.errores.some((e) => e.startsWith("items:"))).toBe(true);
    }
  });

  it("rechaza una cantidad negativa con mensaje legible y ruta", () => {
    const resultado = procesarPedido({
      ...pedidoValido,
      items: [{ sku: "SKU-1", cantidad: -3 }],
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.errores).toContain(
        "items.0.cantidad: debe ser un número positivo",
      );
    }
  });

  it("nunca lanza (throw), incluso con basura total", () => {
    expect(() => procesarPedido(null)).not.toThrow();
    expect(() => procesarPedido("basura")).not.toThrow();
    expect(() => procesarPedido(42)).not.toThrow();
    expect(() => procesarPedido(undefined)).not.toThrow();

    // Y además devuelve un resultado bien formado, no una excepción tragada.
    const resultado = procesarPedido(null);
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.errores.length).toBeGreaterThan(0);
    }
  });
});