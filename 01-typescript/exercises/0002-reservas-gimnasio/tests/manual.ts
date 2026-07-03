import { bookSession, totalAttendees, ClassSession, Booking } from '../src/reservas';

const sesionYoga: ClassSession = {
    id: 'yoga-101',
    nombre: 'Yoga Principiantes',
    cupoMaximo: 10,
    estado: 'scheduled'
};

const listaInicial: Booking[] = [];

console.log("Iniciando pruebas de lógica de negocio requeridas...");

// Caso de prueba 1: Mismo cliente reservando dos veces (Debe sumar los asistentes)
try {
    const paso1 = bookSession(listaInicial, sesionYoga, 'Carlos', 2);
    // Carlos vuelve a reservar para la misma sesión agregando 3 personas más
    const paso2 = bookSession(paso1, sesionYoga, 'Carlos', 3);

    console.assert(paso2.length === 1, "Error: Debería haber una sola fila de reserva para Carlos");
    console.assert(paso2[0].personas === 5, "Error: Las personas no se sumaron correctamente (debió ser 5)");
    
    console.log("Prueba de acumulación de personas aprobada.");
} catch (error) {
    console.error("La prueba de acumulación falló inesperadamente:", error);
}

// Caso de prueba 2: Dos clientes distintos en la misma sesión (Deben quedar separados)
try {
    const paso1 = bookSession(listaInicial, sesionYoga, 'Carlos', 2);
    // Ana reserva cupos en la misma sesión donde ya está Carlos
    const paso2 = bookSession(paso1, sesionYoga, 'Ana', 3);

    console.assert(paso2.length === 2, "Error: Deberían existir dos reservas separadas en la lista");
    console.assert(paso2[0].cliente === 'Carlos' && paso2[0].personas === 2, "Error: Los datos de Carlos cambiaron");
    console.assert(paso2[1].cliente === 'Ana' && paso2[1].personas === 3, "Error: Los datos de Ana no se guardaron");
    
    const total = totalAttendees(paso2);
    console.assert(total === 5, "Error: El cálculo de asistencia total falló para clientes separados");

    console.log("Prueba de clientes independientes aprobada.");
} catch (error) {
    console.error("La prueba de clientes independientes falló inesperadamente:", error);
}

console.log("Pruebas completadas.");
