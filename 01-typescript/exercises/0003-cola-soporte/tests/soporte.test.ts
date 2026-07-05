import { asignar, resolver, calcularCargaDeTrabajo, Ticket, Asignacion } from '../src/soporte';

function crearTicket(overrides: Partial<Ticket> = {}): Ticket {
    return {
        id: 1,
        titulo: 'Algo no funciona',
        prioridad: 'Medio Alto',
        estado: 'abierto',
        ...overrides,
    };
}

console.log("Iniciando pruebas de lógica de negocio de tickets...");

// Caso de prueba 1: caso feliz -> asignar y luego resolver
try {
    const ticketAbierto = crearTicket();
    const asignaciones = asignar([], ticketAbierto, 'Ana', '2026-07-01T10:00:00Z');

    console.assert(asignaciones.length === 1, "Error: debería haber una sola asignación");
    console.assert(asignaciones[0].agente === 'Ana', "Error: el agente no quedó guardado");
    console.assert(asignaciones[0].estado === 'asignado', "Error: el estado no pasó a 'asignado'");

    const ticketAsignado: Ticket = { ...ticketAbierto, estado: 'asignado' };
    const resuelto = resolver(ticketAsignado, asignaciones);

    console.assert(resuelto.estado === 'resuelto', "Error: el ticket debería quedar 'resuelto'");
    console.assert(resuelto.id === ticketAbierto.id, "Error: el id no debería cambiar al resolver");

    console.log("Prueba de caso feliz (asignar + resolver) aprobada.");
} catch (error) {
    console.error("La prueba de caso feliz falló inesperadamente:", error);
}

// Caso de prueba 2: no se puede resolver un ticket que nunca fue asignado
try {
    const ticket = crearTicket(); // sigue 'abierto', sin asignaciones
    let lanzoError = false;

    try {
        resolver(ticket, []);
    } catch {
        lanzoError = true;
    }

    console.assert(lanzoError, "Error: resolver un ticket sin asignar debería lanzar un error");
    console.log("Prueba de resolver sin asignar aprobada.");
} catch (error) {
    console.error("La prueba de resolver sin asignar falló inesperadamente:", error);
}

// Caso de prueba 3: no se puede asignar un ticket cerrado
try {
    const ticketCerrado = crearTicket({ estado: 'cerrado' });
    let lanzoError = false;

    try {
        asignar([], ticketCerrado, 'Ana', '2026-07-01T10:00:00Z');
    } catch {
        lanzoError = true;
    }

    console.assert(lanzoError, "Error: asignar un ticket cerrado debería lanzar un error");
    console.log("Prueba de asignar ticket cerrado aprobada.");
} catch (error) {
    console.error("La prueba de asignar ticket cerrado falló inesperadamente:", error);
}

// Caso de prueba 4: reasignación de un ticket ya asignado a otro agente
try {
    const ticket = crearTicket({ estado: 'asignado' });
    const asignacionPrevia: Asignacion = {
        ...ticket,
        agente: 'Luis',
        asignadoEn: '2026-07-01T09:00:00Z',
    };

    // Guardamos el console.warn original para restaurarlo después,
    // y contamos cuántas veces se llama para verificar el aviso.
    const warnOriginal = console.warn;
    let avisos = 0;
    console.warn = () => { avisos++; };

    const resultado = asignar([asignacionPrevia], ticket, 'Ana', '2026-07-01T10:00:00Z');

    console.warn = warnOriginal;

    console.assert(resultado.length === 2, "Error: debería haber dos filas (historial de asignaciones)");
    console.assert(resultado[1].agente === 'Ana', "Error: la nueva asignación debería ser de Ana");
    console.assert(avisos === 1, "Error: la reasignación debería avisar con console.warn");

    console.log("Prueba de reasignación aprobada.");
} catch (error) {
    console.error("La prueba de reasignación falló inesperadamente:", error);
}

// Caso de prueba 5: no se puede resolver un ticket ya resuelto
try {
    const ticketResuelto = crearTicket({ estado: 'resuelto' });
    let lanzoError = false;

    try {
        resolver(ticketResuelto, []);
    } catch {
        lanzoError = true;
    }

    console.assert(lanzoError, "Error: resolver un ticket ya resuelto debería lanzar un error");
    console.log("Prueba de resolver ticket ya resuelto aprobada.");
} catch (error) {
    console.error("La prueba de resolver ticket ya resuelto falló inesperadamente:", error);
}

// Caso de prueba 6: no se puede resolver un ticket cerrado
try {
    const ticketCerrado = crearTicket({ estado: 'cerrado' });
    let lanzoError = false;

    try {
        resolver(ticketCerrado, []);
    } catch {
        lanzoError = true;
    }

    console.assert(lanzoError, "Error: resolver un ticket cerrado debería lanzar un error");
    console.log("Prueba de resolver ticket cerrado aprobada.");
} catch (error) {
    console.error("La prueba de resolver ticket cerrado falló inesperadamente:", error);
}

// Caso de prueba 7: carga de trabajo por agente, con agentes en 0 y tickets sin asignar
try {
    const tickets: Ticket[] = [
        crearTicket({ id: 1, estado: 'abierto' }),
        crearTicket({ id: 2, estado: 'asignado' }),
        crearTicket({ id: 3, estado: 'resuelto' }),
    ];
    const asignaciones: Asignacion[] = [
        { ...tickets[1], agente: 'Ana', asignadoEn: '2026-07-01T09:00:00Z' },
    ];

    const resultado = calcularCargaDeTrabajo(tickets, asignaciones, ['Ana', 'Luis']);

    console.assert(resultado.sinAsignar === 1, "Error: debería haber 1 ticket sin asignar");
    const cargaAna = resultado.porAgente.find(item => item.agente === 'Ana');
    const cargaLuis = resultado.porAgente.find(item => item.agente === 'Luis');
    console.assert(cargaAna?.carga === 1, "Error: Ana debería tener carga 1");
    console.assert(cargaLuis?.carga === 0, "Error: Luis debería aparecer con carga 0");

    console.log("Prueba de carga de trabajo aprobada.");
} catch (error) {
    console.error("La prueba de carga de trabajo falló inesperadamente:", error);
}

console.log("Pruebas completadas.");