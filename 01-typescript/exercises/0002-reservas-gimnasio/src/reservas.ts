export interface ClassSession {
    id: string;
    nombre: string;
    cupoMaximo: number;
    estado: 'scheduled' | 'cancelled' | 'completed';
}

export type Booking = ClassSession & { cliente: string; personas: number };

// 1. Aplicamos Readonly<ClassSession> en la firma
export function bookSession(
    bookings: Booking[], 
    session: Readonly<ClassSession>, 
    cliente: string, 
    personas: number
): Booking[] {
    if (personas <= 0) {
        throw new Error('La reserva debe tener al menos una persona.');
    }
    
    const existe = bookings.find(item => item.id === session.id && item.cliente === cliente);

    if (!existe) {
        return [...bookings, { ...session, cliente, personas }];
    } else {
        return bookings.map(item =>
            item === existe 
                ? { ...item, cliente: cliente, personas: item.personas + personas }
                : item
        );
    }
}

// Nota: Corregimos el .reduce para que sume correctamente el acumulado
export function totalAttendees(bookings: Booking[]): number {
    return bookings.reduce((acumulado, item) => {
        return acumulado + item.personas; 
    }, 0);
}

// 1. Aplicamos Readonly<ClassSession> en la firma
export function cancelSession(session: Readonly<ClassSession>): ClassSession {
    return {
        ...session,
        estado: 'cancelled',
    };
}
