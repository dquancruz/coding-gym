import { crearBus } from "../src/bus-eventos";
import type { EventMap } from "../src/bus-eventos";

// ═══════════════════════════════════════════════════════════════════════════
// HARNESS (inline: el enunciado prohíbe librerías externas)
// ═══════════════════════════════════════════════════════════════════════════

let fallos = 0;
let corridos = 0;

function test(nombre: string, fn: () => void): void {
  corridos++;
  try {
    fn();
    console.log(`✅ ${nombre}`);
  } catch (e) {
    fallos++;
    console.error(`❌ ${nombre}\n   ${e instanceof Error ? e.message : String(e)}`);
  }
}

function assert(condicion: boolean, mensaje: string): asserts condicion {
  if (!condicion) throw new Error(mensaje);
}

function equal<V>(actual: V, esperado: V, mensaje: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(esperado);
  assert(a === e, `${mensaje} — esperado ${e}, recibido ${a}`);
}

function resumen(): void {
  console.log(`\n${corridos - fallos}/${corridos} tests pasaron`);
  if (fallos > 0) {
    // Tirar acá hace que el proceso salga con código != 0 (útil en CI) sin
    // depender del global `process` de Node: así este archivo no necesita
    // @types/node ni ninguna otra dependencia, y corre igual en Node, Deno,
    // Bun o el navegador. Es "TypeScript puro" de verdad.
    throw new Error(`${fallos} test(s) fallaron`);
  }
  console.log("Todo verde ✨");
}

// ═══════════════════════════════════════════════════════════════════════════
// FIXTURES
// ═══════════════════════════════════════════════════════════════════════════

const pagoFallido: EventMap["PagoFallido"] = {
  ordenId: "ORD-1",
  motivo: "tarjeta_rechazada",
  intentos: 2,
};

const stockBajo: EventMap["StockBajo"] = {
  productoId: "SKU-9",
  existencias: 3,
  umbral: 10,
};

const ordenColocada: EventMap["OrdenColocada"] = {
  ordenId: "ORD-1",
  items: [{ sku: "SKU-9", cantidad: 1 }],
  total: 249.99,
  moneda: "GTQ",
};

// ═══════════════════════════════════════════════════════════════════════════
// REQUISITOS BASE
// ═══════════════════════════════════════════════════════════════════════════

test("un handler recibe el payload correcto al emitir su evento", () => {
  const bus = crearBus<EventMap>();
  let recibido: EventMap["PagoFallido"] | null = null;

  bus.on("PagoFallido", (p) => {
    recibido = p; // p ya viene tipado: no hace falta anotarlo
  });
  bus.emit("PagoFallido", pagoFallido);

  equal(recibido, pagoFallido, "el payload recibido no coincide con el emitido");
});

test("múltiples handlers del mismo evento corren, en orden de suscripción", () => {
  const bus = crearBus<EventMap>();
  const orden: number[] = [];

  bus.on("StockBajo", () => orden.push(1));
  bus.on("StockBajo", () => orden.push(2));
  bus.on("StockBajo", () => orden.push(3));

  bus.emit("StockBajo", stockBajo);

  equal(orden, [1, 2, 3], "los handlers no corrieron en orden de suscripción");
});

test("aislamiento: emitir otro evento NO invoca al handler", () => {
  const bus = crearBus<EventMap>();
  let pagos = 0;
  let stocks = 0;

  bus.on("PagoFallido", () => { pagos++; });
  bus.on("StockBajo", () => { stocks++; });

  bus.emit("StockBajo", stockBajo);
  bus.emit("OrdenColocada", ordenColocada);

  equal(pagos, 0, "el handler de PagoFallido se invocó con otro evento");
  equal(stocks, 1, "el handler de StockBajo debía invocarse una vez");
});

test("la función devuelta por on() detiene las notificaciones futuras", () => {
  const bus = crearBus<EventMap>();
  let llamadas = 0;

  const desuscribir = bus.on("StockBajo", () => { llamadas++; });

  bus.emit("StockBajo", stockBajo);
  desuscribir();
  bus.emit("StockBajo", stockBajo);

  equal(llamadas, 1, "el handler siguió recibiendo después de desuscribirse");
});

test("off() tiene el mismo efecto que la función devuelta por on()", () => {
  const bus = crearBus<EventMap>();
  let llamadas = 0;
  const handler = (): void => { llamadas++; };

  bus.on("StockBajo", handler);
  bus.emit("StockBajo", stockBajo);
  bus.off("StockBajo", handler);
  bus.emit("StockBajo", stockBajo);

  equal(llamadas, 1, "off() no desuscribió el handler");
});

test("off() solo quita el handler indicado, no los demás", () => {
  const bus = crearBus<EventMap>();
  const corridosH: string[] = [];
  const a = (): void => { corridosH.push("a"); };
  const b = (): void => { corridosH.push("b"); };

  bus.on("StockBajo", a);
  bus.on("StockBajo", b);
  bus.off("StockBajo", a);
  bus.emit("StockBajo", stockBajo);

  equal(corridosH, ["b"], "off() afectó a un handler que no correspondía");
});

// ═══════════════════════════════════════════════════════════════════════════
// DECISIONES DOCUMENTADAS (cada una con su test, no solo un comentario)
// ═══════════════════════════════════════════════════════════════════════════

test("DECISIÓN 1: si un handler tira, los demás igual corren y el error se reporta", () => {
  const errores: unknown[] = [];
  const bus = crearBus<EventMap>({ onError: (e) => errores.push(e) });
  const ejecutados: string[] = [];

  bus.on("StockBajo", () => { ejecutados.push("a"); });
  bus.on("StockBajo", () => { throw new Error("boom"); });
  bus.on("StockBajo", () => { ejecutados.push("c"); });

  bus.emit("StockBajo", stockBajo); // no debe propagar la excepción

  equal(ejecutados, ["a", "c"], "el handler posterior al que falló no corrió");
  equal(errores.length, 1, "el error no llegó a onError");
  assert(
    errores[0] instanceof Error && errores[0].message === "boom",
    "onError recibió un error distinto al esperado",
  );
});

test("DECISIÓN 2: desuscribir dos veces (u off de algo no suscrito) es idempotente", () => {
  const bus = crearBus<EventMap>();
  let llamadas = 0;
  const handler = (): void => { llamadas++; };

  const desuscribir = bus.on("StockBajo", handler);

  desuscribir();
  desuscribir();                    // segunda llamada: no-op, no tira
  bus.off("StockBajo", handler);    // handler que ya no está: no-op
  bus.off("PagoFallido", () => {}); // evento sin lista alguna: no-op

  bus.emit("StockBajo", stockBajo);
  equal(llamadas, 0, "el handler seguía suscrito");
});

test("DECISIÓN 2 (corolario): la doble desuscripción no borra una re-suscripción", () => {
  const bus = crearBus<EventMap>();
  let llamadas = 0;
  const handler = (): void => { llamadas++; };

  const desuscribir = bus.on("StockBajo", handler);
  desuscribir();
  bus.on("StockBajo", handler); // el MISMO handler se vuelve a suscribir
  desuscribir();                // no debe tocar la nueva suscripción

  bus.emit("StockBajo", stockBajo);
  equal(llamadas, 1, "la re-suscripción fue borrada por la desuscripción vieja");
});

test("DECISIÓN 3: emit sin handlers suscritos simplemente no hace nada", () => {
  const bus = crearBus<EventMap>();

  bus.emit("UsuarioRegistrado", {
    usuarioId: "U-1",
    email: "ana@tienda.gt",
    registradoEn: new Date(),
  });

  assert(true, "emit sin handlers no debería tirar"); // llegar acá ES el test
});

// ═══════════════════════════════════════════════════════════════════════════
// STRETCH: onOnce
// ═══════════════════════════════════════════════════════════════════════════

test("onOnce se desuscribe automáticamente tras la primera invocación", () => {
  const bus = crearBus<EventMap>();
  let llamadas = 0;

  bus.onOnce("StockBajo", () => { llamadas++; });

  bus.emit("StockBajo", stockBajo);
  bus.emit("StockBajo", stockBajo);
  bus.emit("StockBajo", stockBajo);

  equal(llamadas, 1, "onOnce se invocó más de una vez");
});

test("onOnce puede desuscribirse ANTES de dispararse", () => {
  const bus = crearBus<EventMap>();
  let llamadas = 0;

  const desuscribir = bus.onOnce("StockBajo", () => { llamadas++; });
  desuscribir();
  bus.emit("StockBajo", stockBajo);

  equal(llamadas, 0, "onOnce corrió pese a haberse desuscrito antes");
});

test("onOnce queda fuera aunque su handler tire una excepción", () => {
  const errores: unknown[] = [];
  const bus = crearBus<EventMap>({ onError: (e) => errores.push(e) });
  let llamadas = 0;

  bus.onOnce("StockBajo", () => {
    llamadas++;
    throw new Error("boom");
  });

  bus.emit("StockBajo", stockBajo);
  bus.emit("StockBajo", stockBajo);

  equal(llamadas, 1, "el onOnce que falló quedó suscrito");
  equal(errores.length, 1, "el error del onOnce no se reportó");
});

// ═══════════════════════════════════════════════════════════════════════════
// ROBUSTEZ: mutación durante emit
// ═══════════════════════════════════════════════════════════════════════════

test("desuscribirse desde adentro de un emit no rompe la iteración", () => {
  const bus = crearBus<EventMap>();
  const ejecutados: string[] = [];

  const desuscribirA = bus.on("StockBajo", () => {
    ejecutados.push("a");
    desuscribirA(); // se saca a sí mismo en pleno emit
  });
  bus.on("StockBajo", () => { ejecutados.push("b"); });

  bus.emit("StockBajo", stockBajo);
  bus.emit("StockBajo", stockBajo);

  equal(ejecutados, ["a", "b", "b"], "la copia defensiva del emit no funcionó");
});

resumen();