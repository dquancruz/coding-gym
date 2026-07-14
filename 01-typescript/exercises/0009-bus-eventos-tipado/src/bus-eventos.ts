/**
 * BUS DE EVENTOS TIPADO
 * TypeScript puro, sin dependencias. Compila en `strict: true`, cero `any`.
 *
 * ─── DECISIONES DE COMPORTAMIENTO ──────────────────────────────────────────
 *
 * 1) UN HANDLER TIRA DURANTE `emit` → los demás IGUAL corren.
 *    El error se atrapa por handler, se reporta vía `onError` (inyectable) y la
 *    iteración sigue. `emit` nunca propaga.
 *    Razón: un bus es fan-out; los suscriptores no se conocen entre sí. Que el
 *    módulo de emails se caiga no puede impedir que analytics registre la orden.
 *    Dejar propagar acoplaría el éxito del emisor a la salud de un suscriptor
 *    arbitrario — justo lo que el pub/sub viene a evitar. Tampoco lo tragamos en
 *    silencio: `onError` lo hace observable (y testeable).
 *
 * 2) DESUSCRIBIR DOS VECES → seguro (idempotente).
 *    Llamar dos veces la función que devuelve `on`, o `off` con un handler que ya
 *    no está, es un no-op. Razón: los unsubscribe viven en cleanups (useEffect,
 *    finally, teardown) que perfectamente corren más de una vez; que exploten no
 *    aporta nada.
 *
 * 3) `emit` SIN HANDLERS → no hace nada, en silencio.
 *    Que nadie escuche StockBajo no es un error: es el estado normal al arrancar,
 *    y la premisa del patrón (el emisor no sabe quién escucha).
 *
 * ─── DECISIONES DE DISEÑO ──────────────────────────────────────────────────
 *
 * 4) ESTRUCTURA `{ [K in keyof T]?: Handler<T[K]>[] }` (un Record parcial), no un Map.
 *    El mapped type conserva la correlación K → Handler<T[K]> a nivel de tipo: al
 *    leer listeners["PagoFallido"] TS ya sabe qué payload vive ahí, sin castear.
 *    Un `Map<keyof T, Handler<...>[]>` es genérico en UNA sola clave, así que
 *    `.get(k)` devuelve el mismo tipo para toda clave: la relación evento↔payload
 *    se pierde y hay que castear en cada lectura — justo lo que el ejercicio evita.
 *    Las ventajas reales del Map (claves no-string, no colisión con
 *    Object.prototype) no aplican: las claves salen de `keyof TEventMap`, son
 *    literales del desarrollador, nunca input de usuario.
 *
 * 5) RESTRICCIÓN DEL GENÉRICO: `T extends Record<keyof T, unknown>`, NO
 *    `Record<string, unknown>`. Una `interface` no tiene index signature implícita,
 *    así que `EventMap` (interface, para permitir declaration merging) NO satisface
 *    `Record<string, unknown>` y TS lo rechaza. `Record<keyof T, unknown>` expresa
 *    lo mismo ("objeto con valores de cualquier tipo") y sí acepta interfaces.
 *    Alternativa: declarar EventMap como `type`; preferí conservar el merging.
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. MAPA DE EVENTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * `interface` a propósito: permite declaration merging, o sea que otro módulo
 * puede agregar sus eventos sin tocar este archivo.
 *
 * Los payloads tienen formas deliberadamente distintas entre sí: esa diferencia
 * es lo que le da al compilador algo que rechazar cuando alguien suscribe un
 * handler al evento equivocado.
 */
export interface EventMap {
  OrdenColocada: {
    ordenId: string;
    items: ReadonlyArray<{ sku: string; cantidad: number }>;
    total: number;
    moneda: "GTQ" | "USD";
  };

  PagoFallido: {
    ordenId: string;
    motivo: "fondos_insuficientes" | "tarjeta_rechazada" | "timeout";
    intentos: number;
  };

  StockBajo: {
    productoId: string;
    existencias: number;
    umbral: number;
  };

  UsuarioRegistrado: {
    usuarioId: string;
    email: string;
    registradoEn: Date;
    referidoPor?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. TIPOS DE APOYO
// ═══════════════════════════════════════════════════════════════════════════

/** Un handler consume un payload y no devuelve nada útil. */
export type Handler<P> = (payload: P) => void;

/**
 * Tipo condicional con `infer`: dado el tipo de una función handler, extrae el
 * tipo de su payload. Así la relación evento→payload se DERIVA en vez de
 * repetirse a mano en cada firma.
 *
 *   PayloadDe<Handler<{ ordenId: string }>>  ===  { ordenId: string }
 *   PayloadDe<string>                        ===  never
 */
export type PayloadDe<H> = H extends (payload: infer P) => void ? P : never;

/** El handler que le corresponde a la clave K del mapa T. */
export type HandlerDe<T, K extends keyof T> = Handler<T[K]>;

/** Lo que devuelve `on`: llamarla desuscribe. Es idempotente. */
export type Desuscribir = () => void;

/** Almacenamiento de listeners. Ver decisión (4) arriba. */
type Listeners<T> = { [K in keyof T]?: Array<Handler<T[K]>> };

// ═══════════════════════════════════════════════════════════════════════════
// 3. EL BUS
// ═══════════════════════════════════════════════════════════════════════════

export interface Bus<T extends Record<keyof T, unknown>> {
  /** Suscribe un handler. Devuelve una función (idempotente) para desuscribir. */
  on<K extends keyof T>(evento: K, handler: HandlerDe<T, K>): Desuscribir;

  /** Desuscribe un handler puntual. No-op si ya no estaba suscrito. */
  off<K extends keyof T>(evento: K, handler: HandlerDe<T, K>): void;

  /** Como `on`, pero se desuscribe solo después de la primera invocación. */
  onOnce<K extends keyof T>(evento: K, handler: HandlerDe<T, K>): Desuscribir;

  /** Dispara el evento. Los handlers corren en orden de suscripción. */
  emit<K extends keyof T>(evento: K, payload: PayloadDe<HandlerDe<T, K>>): void;
}

export interface OpcionesBus<T> {
  /**
   * Se invoca cuando un handler tira durante `emit`. Default: `console.error`.
   * Inyectable para que los tests puedan observar el error.
   */
  onError?: (error: unknown, evento: keyof T) => void;
}

export function crearBus<T extends Record<keyof T, unknown>>(
  opciones: OpcionesBus<T> = {},
): Bus<T> {
  const listeners: Listeners<T> = {};

  const onError =
    opciones.onError ??
    ((error: unknown, evento: keyof T): void => {
      console.error(`[bus] un handler falló en "${String(evento)}":`, error);
    });

  function off<K extends keyof T>(evento: K, handler: HandlerDe<T, K>): void {
    const lista = listeners[evento];
    if (lista === undefined) return; // idempotente: no hay nada que quitar

    const i = lista.indexOf(handler);
    if (i === -1) return; // idempotente: ese handler ya no estaba

    lista.splice(i, 1);
    if (lista.length === 0) delete listeners[evento]; // no dejamos arrays vacíos
  }

  function on<K extends keyof T>(
    evento: K,
    handler: HandlerDe<T, K>,
  ): Desuscribir {
    const lista = listeners[evento] ?? (listeners[evento] = []);
    lista.push(handler); // push preserva el orden de suscripción

    // El flag no es cosmético: sin él, llamar dos veces a `desuscribir()` podría
    // borrar por accidente una RE-suscripción posterior del mismo handler (el
    // indexOf encontraría la nueva). El flag ata la desuscripción a ESA
    // suscripción puntual, no al handler en general. Hay un test para esto.
    let yaDesuscrito = false;
    return (): void => {
      if (yaDesuscrito) return;
      yaDesuscrito = true;
      off(evento, handler);
    };
  }

  function onOnce<K extends keyof T>(
    evento: K,
    handler: HandlerDe<T, K>,
  ): Desuscribir {
    const envoltorio: HandlerDe<T, K> = (payload): void => {
      // Desuscribimos ANTES de invocar: si el handler tira, igual queda fuera.
      desuscribir();
      handler(payload);
    };
    const desuscribir = on(evento, envoltorio);
    return desuscribir;
  }

  function emit<K extends keyof T>(
    evento: K,
    payload: PayloadDe<HandlerDe<T, K>>,
  ): void {
    const lista = listeners[evento];
    if (lista === undefined || lista.length === 0) return; // decisión (3)

    // Copia defensiva: si un handler se suscribe o desuscribe durante el emit,
    // no queremos mutar el array que estamos recorriendo.
    for (const handler of [...lista]) {
      try {
        // Único cast del archivo, y NO es `any`: PayloadDe<Handler<T[K]>> y T[K]
        // son el mismo tipo, pero TS no resuelve el condicional mientras K sigue
        // sin instanciar. No relaja nada del lado de quien llama.
        handler(payload as T[K]);
      } catch (error) {
        onError(error, evento); // decisión (1): aislamos, los demás siguen
      }
    }
  }

  return { on, off, onOnce, emit };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. LO QUE EL COMPILADOR RECHAZA (descomentá cualquiera para verlo)
// ═══════════════════════════════════════════════════════════════════════════
//
// const bus = crearBus<EventMap>();
//
// bus.on("PagoFallido", (p) => p.motivo);   // ✅ payload inferido, sin anotarlo
//
// bus.on("PagoFallido", (p: { productoId: string }) => {});
//   ❌ 'productoId' is missing in type PagoFallido
//
// bus.emit("PagoFallido", { ordenId: "A1", motivo: "timeout" });
//   ❌ Property 'intentos' is missing
//
// bus.emit("PagoFallido", { ordenId: "A1", motivo: "timeut", intentos: 1 });
//   ❌ Type '"timeut"' is not assignable to '"fondos_insuficientes" | ...'
//
// bus.on("PagoFalido", () => {});
//   ❌ Argument of type '"PagoFalido"' is not assignable to keyof EventMap