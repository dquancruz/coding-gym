export interface Ticket {
    id: number;
    titulo: string;
    prioridad: 'Alto' | 'Medio Alto' | 'Medio bajo' | 'Bajo';
    estado: 'abierto' | 'asignado' | 'resuelto' | 'cerrado';
}

// Un ticket asignado es un Ticket + los datos de la asignación.
// Se modela por composición (intersection type) en vez de repetir los
// campos de Ticket a mano en una interface nueva.
export type Asignacion = Ticket & { agente: string; asignadoEn: string };

export interface CargaAgente {
    agente: string;
    carga: number;
}

export interface ResultadoCarga {
    porAgente: CargaAgente[];
    sinAsignar: number; // tickets abiertos, sin agente
}

// --- Manejo de errores: por qué `throw` y no un resultado con unión discriminada ---
// Elegí excepciones (`throw`) para las operaciones inválidas (asignar un ticket
// cerrado, resolver un ticket sin asignar) porque representan un error del
// llamador -- un estado que no debería darse en un flujo normal del negocio --
// y quiero que sea imposible ignorarlas por accidente: un `throw` interrumpe
// la ejecución sí o sí, mientras que un valor de retorno tipo
// `{ ok: false, error }` puede ignorarse simplemente no chequeando el campo `ok`.
// Para la reasignación, en cambio, uso `console.warn`: es una operación válida
// del negocio (transferir un ticket de un agente a otro), solo que no debe
// pasar en silencio, por eso se registra pero no bloquea la ejecución.

/**
 * Asigna un ticket a un agente.
 * - Si el ticket está cerrado, lanza un error (no se puede reabrir asignando).
 * - Si el ticket ya estaba asignado a otro agente, lo permite (reasignación)
 *   pero deja constancia con un warning, ya que no es un error del negocio.
 */
export function asignar(
    asignaciones: Readonly<Asignacion[]>,
    ticket: Readonly<Ticket>,
    agente: string,
    asignadoEn: string
): Asignacion[] {
    if (ticket.estado === 'cerrado') {
        throw new Error(
            `No se puede asignar el ticket #${ticket.id} ("${ticket.titulo}"): ya está cerrado`
        );
    }

    // Asignacion[] es un historial: puede haber varias filas para el mismo
    // ticket (por reasignaciones pasadas). Buscamos la más reciente para
    // saber quién es el agente "actual" antes de este cambio.
    const asignacionActual = asignaciones
        .filter(item => item.id === ticket.id)
        .sort((a, b) => new Date(b.asignadoEn).getTime() - new Date(a.asignadoEn).getTime())[0];

    if (asignacionActual && asignacionActual.agente !== agente) {
        console.warn(
            `Reasignando ticket #${ticket.id}: de ${asignacionActual.agente} a ${agente}`
        );
    }

    const nuevaAsignacion: Asignacion = {
        ...ticket,
        estado: 'asignado',
        agente,
        asignadoEn,
    };

    return [...asignaciones, nuevaAsignacion];
}

/**
 * Resuelve un ticket.
 * - Si el ticket está cerrado, lanza un error.
 * - Si el ticket nunca fue asignado a nadie, lanza un error (no puede
 *   resolverse algo que nadie trabajó).
 */
export function resolver(
    ticket: Readonly<Ticket>,
    asignaciones: Readonly<Asignacion[]>
): Ticket {
    if (ticket.estado === 'cerrado' || ticket.estado === 'resuelto') {
        throw new Error(`El ticket #${ticket.id} ya está en estado "${ticket.estado}"`);
    }

    // .some() devuelve un boolean real; a diferencia de .filter(), que
    // siempre devuelve un array (incluso vacío), y un array vacío es
    // "truthy" en JS -- por eso NO se puede usar !asignaciones.filter(...)
    // para chequear ausencia de asignación.
    const tieneAsignacion = asignaciones.some(item => item.id === ticket.id);
    if (!tieneAsignacion) {
        throw new Error(`El ticket #${ticket.id} nunca fue asignado, no puede resolverse`);
    }

    return {
        ...ticket,
        estado: 'resuelto',
    };
}

/**
 * Calcula la carga de trabajo (tickets abiertos o asignados) por agente.
 * - Todos los agentes de la lista aparecen en el resultado, aunque tengan 0.
 * - Los tickets 'abierto' no tienen agente, se cuentan aparte en `sinAsignar`.
 * - Los tickets 'resuelto' y 'cerrado' no cuentan para nadie.
 */
export function calcularCargaDeTrabajo(
    tickets: Readonly<Ticket[]>,
    asignaciones: Readonly<Asignacion[]>,
    agentes: Readonly<string[]>
): ResultadoCarga {
    // Para tickets 'asignado' necesitamos saber quién es el agente vigente:
    // tomamos la asignación más reciente por ticket (por si fue reasignado).
    const ultimaAsignacionPorTicket = new Map<number, Asignacion>();
    for (const item of asignaciones) {
        const actual = ultimaAsignacionPorTicket.get(item.id);
        if (!actual || new Date(item.asignadoEn) > new Date(actual.asignadoEn)) {
            ultimaAsignacionPorTicket.set(item.id, item);
        }
    }

    // Arrancamos todos los agentes en 0 para que aparezcan en el resultado
    // aunque no tengan ningún ticket asignado.
    const cargaPorAgente = new Map<string, number>(agentes.map(a => [a, 0]));
    let sinAsignar = 0;

    for (const ticket of tickets) {
        if (ticket.estado === 'abierto') {
            sinAsignar++;
        } else if (ticket.estado === 'asignado') {
            const asignacion = ultimaAsignacionPorTicket.get(ticket.id);
            if (asignacion) {
                cargaPorAgente.set(
                    asignacion.agente,
                    (cargaPorAgente.get(asignacion.agente) ?? 0) + 1
                );
            }
        }
        // 'resuelto' y 'cerrado' no cuentan
    }

    return {
        porAgente: Array.from(cargaPorAgente, ([agente, carga]) => ({ agente, carga })),
        sinAsignar,
    };
}