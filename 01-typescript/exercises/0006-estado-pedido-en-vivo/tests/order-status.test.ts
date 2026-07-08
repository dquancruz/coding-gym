// ===========================================================================
// order-status.test.ts — Tests del estado de pedido
// ---------------------------------------------------------------------------
// Sin framework externo: un mini-helper de aserción propio. Importa las
// funciones del archivo de solución y las ejercita.
// ===========================================================================

import {
  describeStatus,
  describeStatusV2,
  isTerminal,
  canTransition,
} from '../src/order-status';

// --- Mini test harness ---------------------------------------------------

let failures = 0;

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    failures++;
    console.error(`❌ ${label}`);
    console.error(`   esperado: ${JSON.stringify(expected)}`);
    console.error(`   recibido: ${JSON.stringify(actual)}`);
  } else {
    console.log(`✅ ${label}`);
  }
}

// --- describeStatus: un caso por cada uno de los 5 estados ---------------

assertEqual(
  describeStatus({ status: 'placed', placedAt: new Date() }),
  'Recibimos tu pedido. Lo estamos confirmando con el restaurante.',
  'describeStatus(placed)',
);

assertEqual(
  describeStatus({ status: 'preparing', estimatedReadyMinutes: 20 }),
  'El restaurante está preparando tu pedido (listo en ~20 min).',
  'describeStatus(preparing)',
);

assertEqual(
  describeStatus({ status: 'out_for_delivery', estimatedMinutes: 12, courier: 'Ana' }),
  'Ana lleva tu pedido en camino. Llega en ~12 min.',
  'describeStatus(out_for_delivery)',
);

{
  // toLocaleString() depende de locale/zona: calculo el esperado con la misma
  // fecha para que el test sea determinista.
  const entrega = new Date('2026-01-15T13:45:00Z');
  assertEqual(
    describeStatus({ status: 'delivered', deliveredAt: entrega }),
    `¡Entregado! Tu pedido llegó el ${entrega.toLocaleString()}. Buen provecho.`,
    'describeStatus(delivered)',
  );
}

assertEqual(
  describeStatus({ status: 'cancelled', reason: 'Restaurante cerrado' }),
  'Tu pedido fue cancelado. Motivo: Restaurante cerrado.',
  'describeStatus(cancelled)',
);

// --- isTerminal: al menos un terminal y uno no terminal ------------------

assertEqual(isTerminal({ status: 'delivered', deliveredAt: new Date() }), true,  'isTerminal(delivered) === true');
assertEqual(isTerminal({ status: 'cancelled', reason: 'x' }),             true,  'isTerminal(cancelled) === true');
assertEqual(isTerminal({ status: 'placed', placedAt: new Date() }),       false, 'isTerminal(placed) === false');
assertEqual(isTerminal({ status: 'preparing', estimatedReadyMinutes: 5 }), false, 'isTerminal(preparing) === false');

// --- canTransition (stretch) ---------------------------------------------

assertEqual(canTransition('placed', 'preparing'),           true,  'placed -> preparing (OK)');
assertEqual(canTransition('preparing', 'out_for_delivery'), true,  'preparing -> out_for_delivery (OK)');
assertEqual(canTransition('cancelled', 'preparing'),        false, 'cancelled -> preparing (bloqueado)');
assertEqual(canTransition('delivered', 'cancelled'),        false, 'delivered es terminal (bloqueado)');

// --- match / describeStatusV2 (stretch) ----------------------------------

assertEqual(
  describeStatusV2({ status: 'preparing', estimatedReadyMinutes: 20 }),
  describeStatus({ status: 'preparing', estimatedReadyMinutes: 20 }),
  'match(): describeStatusV2 coincide con describeStatus',
);

// --- Resumen -------------------------------------------------------------

if (failures > 0) {
  throw new Error(`\n${failures} test(s) fallaron`);
} else {
  console.log('\n🎉 Todos los tests pasaron');
}