import {
    aprobar,
    rechazar,
    cancelar,
    diasDisponibles,
    Empleado,
    Solicitud,
    SolicitudPendiente,
} from '../src/solicitudes-vacaciones';

const empleado: Empleado = { id: 1, nombre: 'Ana', saldoAnual: 15 };

function crearSolicitud(overrides: Partial<SolicitudPendiente> = {}): SolicitudPendiente {
    return {
        id: 1,
        empleadoId: empleado.id,
        fechaInicio: new Date('2026-08-03'),
        fechaFin: new Date('2026-08-07'),
        cantidadDias: 5,
        estado: 'pendiente',
        ...overrides,
    };
}

console.log("Iniciando pruebas de lógica de negocio de vacaciones...");

// Caso de prueba 1: caso feliz -> aprobar una solicitud dentro del saldo
try {
    const solicitud = crearSolicitud();
    const resultado = aprobar(solicitud, empleado, [solicitud], 'jefa', new Date('2026-07-01'));

    console.assert(resultado.ok, "Error: la aprobación dentro del saldo debería ser exitosa");
    if (resultado.ok) {
        console.assert(resultado.valor.estado === 'aprobada', "Error: el estado no pasó a 'aprobada'");
        console.assert(resultado.valor.revisadaPor === 'jefa', "Error: la revisora no quedó guardada");
        console.assert(resultado.valor.id === solicitud.id, "Error: el id no debería cambiar al aprobar");
        console.assert(resultado.valor.cantidadDias === 5, "Error: los días solicitados no deberían cambiar");
    }
    console.assert(solicitud.estado === 'pendiente', "Error: aprobar no debe mutar la solicitud original");

    console.log("Prueba de caso feliz (aprobar dentro del saldo) aprobada.");
} catch (error) {
    console.error("La prueba de caso feliz falló inesperadamente:", error);
}

// Caso de prueba 2: no se puede aprobar excediendo el saldo disponible
try {
    // Ya hay 12 días aprobados este año: quedan 3 y se piden 5
    const previa = crearSolicitud({ id: 1, cantidadDias: 12 });
    const previaAprobada = aprobar(previa, empleado, [previa], 'jefa');
    console.assert(previaAprobada.ok, "Error: la primera aprobación debería ser exitosa");

    if (previaAprobada.ok) {
        const nueva = crearSolicitud({ id: 2, cantidadDias: 5 });
        const solicitudes: Solicitud[] = [previaAprobada.valor, nueva];
        const resultado = aprobar(nueva, empleado, solicitudes, 'jefa');

        console.assert(!resultado.ok, "Error: aprobar excediendo el saldo debería fallar");
        if (!resultado.ok) {
            console.assert(
                resultado.error.includes('insuficiente'),
                "Error: el mensaje debería indicar saldo insuficiente"
            );
        }
    }

    console.log("Prueba de aprobar excediendo el saldo aprobada.");
} catch (error) {
    console.error("La prueba de saldo insuficiente falló inesperadamente:", error);
}

// Caso de prueba 3: no se puede procesar (aprobar o rechazar) una solicitud ya procesada
try {
    const solicitud = crearSolicitud();
    const aprobada = aprobar(solicitud, empleado, [solicitud], 'jefa');
    console.assert(aprobada.ok, "Error: la aprobación inicial debería ser exitosa");

    if (aprobada.ok) {
        const reAprobar = aprobar(aprobada.valor, empleado, [aprobada.valor], 'jefa');
        console.assert(!reAprobar.ok, "Error: aprobar una solicitud ya procesada debería fallar");

        const reRechazar = rechazar(aprobada.valor, 'jefa', 'Un motivo válido');
        console.assert(!reRechazar.ok, "Error: rechazar una solicitud ya procesada debería fallar");
    }

    console.log("Prueba de procesar una solicitud ya procesada aprobada.");
} catch (error) {
    console.error("La prueba de solicitud ya procesada falló inesperadamente:", error);
}

// Caso de prueba 4: no se puede rechazar sin motivo
try {
    const solicitud = crearSolicitud();

    const sinMotivo = rechazar(solicitud, 'jefa', '');
    console.assert(!sinMotivo.ok, "Error: rechazar con motivo vacío debería fallar");

    const soloEspacios = rechazar(solicitud, 'jefa', '   ');
    console.assert(!soloEspacios.ok, "Error: rechazar con motivo de solo espacios debería fallar");

    const conMotivo = rechazar(solicitud, 'jefa', 'Semana de cierre contable');
    console.assert(conMotivo.ok, "Error: rechazar con motivo válido debería ser exitoso");
    if (conMotivo.ok) {
        console.assert(conMotivo.valor.estado === 'rechazada', "Error: el estado no pasó a 'rechazada'");
        console.assert(
            conMotivo.valor.motivo === 'Semana de cierre contable',
            "Error: el motivo no quedó guardado"
        );
    }

    console.log("Prueba de rechazar sin motivo aprobada.");
} catch (error) {
    console.error("La prueba de rechazar sin motivo falló inesperadamente:", error);
}

// Caso de prueba 5: cancelar una solicitud aprobada devuelve los días al saldo
try {
    const solicitud = crearSolicitud();
    const anio = solicitud.fechaInicio.getFullYear();

    const aprobada = aprobar(solicitud, empleado, [solicitud], 'jefa');
    console.assert(aprobada.ok, "Error: la aprobación inicial debería ser exitosa");

    if (aprobada.ok) {
        console.assert(
            diasDisponibles(empleado, [aprobada.valor], anio) === 10,
            "Error: con 5 días aprobados deberían quedar 10 disponibles"
        );

        const cancelada = cancelar(aprobada.valor);
        console.assert(cancelada.ok, "Error: cancelar una aprobada debería ser exitoso");

        if (cancelada.ok) {
            console.assert(cancelada.valor.estado === 'cancelada', "Error: el estado no pasó a 'cancelada'");
            // Decisión tomada: al cancelarse deja de contar como aprobada,
            // por lo que el saldo vuelve a los 15 días completos.
            console.assert(
                diasDisponibles(empleado, [cancelada.valor], anio) === 15,
                "Error: cancelar la aprobada debería devolver los días al saldo"
            );
        }
    }

    console.log("Prueba de cancelar una solicitud aprobada aprobada.");
} catch (error) {
    console.error("La prueba de cancelar aprobada falló inesperadamente:", error);
}

// Caso de prueba 6: no se puede cancelar una rechazada ni una ya cancelada
try {
    const solicitud = crearSolicitud();
    const rechazada = rechazar(solicitud, 'jefa', 'No hay cobertura del equipo');
    console.assert(rechazada.ok, "Error: el rechazo inicial debería ser exitoso");

    if (rechazada.ok) {
        const resultado = cancelar(rechazada.valor);
        console.assert(!resultado.ok, "Error: cancelar una rechazada debería fallar");
    }

    const otra = crearSolicitud({ id: 2 });
    const cancelada = cancelar(otra);
    console.assert(cancelada.ok, "Error: cancelar una pendiente debería ser exitoso");

    if (cancelada.ok) {
        const reintento = cancelar(cancelada.valor);
        console.assert(!reintento.ok, "Error: cancelar una ya cancelada debería fallar");
    }

    console.log("Prueba de cancelar rechazada/cancelada aprobada.");
} catch (error) {
    console.error("La prueba de cancelar inválida falló inesperadamente:", error);
}

// Caso de prueba 7: días disponibles cuenta solo las aprobadas actuales del año
try {
    const p1 = crearSolicitud({ id: 1, cantidadDias: 4 });
    const a1 = aprobar(p1, empleado, [p1], 'jefa');

    const p2 = crearSolicitud({ id: 2, cantidadDias: 3 });
    const r2 = rechazar(p2, 'jefa', 'No hay cobertura');

    // Solicitud de otro año: no debería contar para 2026
    const p3 = crearSolicitud({
        id: 3,
        cantidadDias: 6,
        fechaInicio: new Date('2027-01-11'),
        fechaFin: new Date('2027-01-16'),
    });

    if (a1.ok && r2.ok) {
        const solicitudes: Solicitud[] = [a1.valor, r2.valor, p3];
        const resultado = diasDisponibles(empleado, solicitudes, 2026);
        console.assert(resultado === 11, "Error: deberían quedar 11 días (15 - 4 aprobados)");
    }

    console.log("Prueba de días disponibles aprobada.");
} catch (error) {
    console.error("La prueba de días disponibles falló inesperadamente:", error);
}

console.log("Pruebas completadas.");