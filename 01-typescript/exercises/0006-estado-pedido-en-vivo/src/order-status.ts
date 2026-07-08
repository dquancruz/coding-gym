// ===========================================================================
// order-status.ts — Estado de pedido con discriminated union
// ---------------------------------------------------------------------------
// Compila en strict SIN tsconfig. Ver README abajo / mensaje del chat.
// ===========================================================================


// ---------------------------------------------------------------------------
// 1) EL MODELO
// ---------------------------------------------------------------------------
// Cada estado es su PROPIO tipo, con SOLO los campos que le corresponden.
// El discriminante es `status`: un string literal distinto en cada caso.
//
// Con esto, un pedido "entregado Y cancelado" a la vez es LITERALMENTE
// irrepresentable: `status` solo puede tener un valor. El bug de producción
// ya no se puede ni construir.

export type Placed = {
  status: 'placed';
  placedAt: Date;
};

export type Preparing = {
  status: 'preparing';
  estimatedReadyMinutes: number;
};

export type OutForDelivery = {
  status: 'out_for_delivery';
  estimatedMinutes: number;
  courier: string;
};

export type Delivered = {
  status: 'delivered';
  deliveredAt: Date;
};

export type Cancelled = {
  status: 'cancelled';
  reason: string;
};

export type OrderStatus =
  | Placed
  | Preparing
  | OutForDelivery
  | Delivered
  | Cancelled;


// ---------------------------------------------------------------------------
// 2) describeStatus — narrowing por switch sobre el discriminante
// ---------------------------------------------------------------------------
// Dentro de cada `case`, TS estrecha `status` a la variante concreta, así que
// solo puedes usar los campos de ESE estado (usar status.reason en 'delivered'
// sería error de compilación).

export function describeStatus(status: OrderStatus): string {
  switch (status.status) {
    case 'placed':
      return 'Recibimos tu pedido. Lo estamos confirmando con el restaurante.';

    case 'preparing':
      return `El restaurante está preparando tu pedido (listo en ~${status.estimatedReadyMinutes} min).`;

    case 'out_for_delivery':
      return `${status.courier} lleva tu pedido en camino. Llega en ~${status.estimatedMinutes} min.`;

    case 'delivered':
      return `¡Entregado! Tu pedido llegó el ${status.deliveredAt.toLocaleString()}. Buen provecho.`;

    case 'cancelled':
      return `Tu pedido fue cancelado. Motivo: ${status.reason}.`;

    default: {
      // Chequeo de exhaustividad: si manejamos los 5 casos, aquí `status` es
      // `never` y esto compila. Si agregas un 6to estado y olvidas su `case`,
      // `status` deja de ser `never` y esta línea NO compila (error en
      // compilación, no en runtime).
      const _exhaustive: never = status;
      throw new Error(`Estado no manejado: ${JSON.stringify(_exhaustive)}`);
    }
  }
}


// ---------------------------------------------------------------------------
// 3) isTerminal — type guard (predicado de tipo)
// ---------------------------------------------------------------------------
// `status is Delivered | Cancelled` le enseña a TS que, si esto da true, en
// ese bloque `status` es terminal. Permite narrowing afuera de la función.

export function isTerminal(status: OrderStatus): status is Delivered | Cancelled {
  return status.status === 'delivered' || status.status === 'cancelled';
}


// ===========================================================================
// STRETCH GOALS
// ===========================================================================

// 4) canTransition — valida transiciones del flujo real.
// `OrderStatus['status']` = 'placed' | 'preparing' | ... (indexed access type).
// Al tipar el mapa como Record<OrderStatus['status'], ...>, si agregas un
// estado nuevo a la union, TS te OBLIGA a agregar su fila aquí.

const VALID_TRANSITIONS: Record<OrderStatus['status'], ReadonlyArray<OrderStatus['status']>> = {
  placed:           ['preparing', 'cancelled'],
  preparing:        ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered:        [], // estado final
  cancelled:        [], // estado final
};

export function canTransition(
  from: OrderStatus['status'],
  to: OrderStatus['status'],
): boolean {
  // indexOf en vez de includes: así compila con cualquier target por defecto,
  // sin necesidad de tsconfig ni de pasar --target.
  return VALID_TRANSITIONS[from].indexOf(to) !== -1;
}


// 5) match — helper genérico para no repetir switch/never cada vez.
// `handlers` tiene EXACTAMENTE una función por estado; cada una recibe su
// variante ya estrechada. La exhaustividad la impone el tipo del objeto:
// si olvidas un handler, TS marca error en la llamada (sin necesidad de never).

export type Handlers<R> = {
  [K in OrderStatus['status']]: (status: Extract<OrderStatus, { status: K }>) => R;
};

export function match<R>(status: OrderStatus, handlers: Handlers<R>): R {
  // Único cast controlado y seguro (nunca `any`): en runtime siempre pasamos
  // el status que corresponde a su handler.
  const table = handlers as Record<OrderStatus['status'], (status: OrderStatus) => R>;
  return table[status.status](status);
}

// describeStatus reescrito con match: fíjate que NO hay `default` ni `never`.
export function describeStatusV2(status: OrderStatus): string {
  return match(status, {
    placed:           ()  => 'Recibimos tu pedido. Lo estamos confirmando con el restaurante.',
    preparing:        (s) => `El restaurante está preparando tu pedido (listo en ~${s.estimatedReadyMinutes} min).`,
    out_for_delivery: (s) => `${s.courier} lleva tu pedido en camino. Llega en ~${s.estimatedMinutes} min.`,
    delivered:        (s) => `¡Entregado! Tu pedido llegó el ${s.deliveredAt.toLocaleString()}. Buen provecho.`,
    cancelled:        (s) => `Tu pedido fue cancelado. Motivo: ${s.reason}.`,
  });
}