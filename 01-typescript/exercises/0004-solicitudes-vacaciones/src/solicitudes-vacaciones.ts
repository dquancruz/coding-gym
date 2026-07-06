// ============================================================================
// Modelo de dominio: vacaciones
// ============================================================================

export interface Empleado {
  id: number;
  nombre: string;
  /** Días totales de vacaciones asignados por año */
  saldoAnual: number;
}

/**
 * Campos comunes a toda solicitud, sin importar su estado.
 * Nota: la solicitud REFERENCIA al empleado por id, no lo extiende.
 */
interface SolicitudBase {
  id: number;
  empleadoId: number;
  fechaInicio: Date;
  fechaFin: Date;
  cantidadDias: number;
}

/**
 * Datos de revisión. Se COMPONE (via intersección) en los estados
 * procesados en lugar de repetir los campos a mano.
 */
export interface Revision {
  revisadaPor: string;
  revisadaEn: Date;
}

// --- Unión discriminada por `estado` -----------------------------------
// Cada variante lleva exactamente los campos que ese estado permite:
//   - 'rechazada' es la ÚNICA que puede (y debe) tener `motivo`
//   - solo 'aprobada' y 'rechazada' llevan datos de revisión
// Así es imposible representar, por ejemplo, una 'pendiente' con motivo
// o una 'rechazada' sin él: el compilador lo rechaza.

export type SolicitudPendiente = SolicitudBase & { estado: 'pendiente' };

export type SolicitudAprobada = SolicitudBase &
  Revision & { estado: 'aprobada' };

export type SolicitudRechazada = SolicitudBase &
  Revision & {
    estado: 'rechazada';
    /** Motivo obligatorio y no vacío (validado en `rechazar`) */
    motivo: string;
  };

export type SolicitudCancelada = SolicitudBase & { estado: 'cancelada' };

export type Solicitud =
  | SolicitudPendiente
  | SolicitudAprobada
  | SolicitudRechazada
  | SolicitudCancelada;

/** Una solicitud ya procesada: aprobada o rechazada */
export type SolicitudProcesada = SolicitudAprobada | SolicitudRechazada;

// ============================================================================
// Manejo de errores: Resultado con unión discriminada
// ============================================================================
// JUSTIFICACIÓN: elegí un tipo Resultado en lugar de excepciones porque:
//   1. Las operaciones inválidas (aprobar sin saldo, rechazar sin motivo,
//      procesar dos veces) son casos de negocio ESPERADOS, no fallas
//      excepcionales del programa.
//   2. El error queda en la firma de la función: quien llama está obligado
//      por el compilador a chequear `ok` antes de usar `valor`, mientras
//      que una excepción se puede olvidar de atrapar sin que TS avise.
//   3. Encaja con el estilo inmutable/funcional del resto del código.

export type Resultado<T> =
  | { ok: true; valor: T }
  | { ok: false; error: string };

const exito = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const fallo = <T>(error: string): Resultado<T> => ({ ok: false, error });

// ============================================================================
// Consultas
// ============================================================================

/**
 * Días disponibles de un empleado para un año dado.
 * Se calcula SOLO a partir de las solicitudes actualmente en estado
 * 'aprobada' (no de un historial): si una aprobada luego se cancela,
 * deja de descontar automáticamente.
 */
export function diasDisponibles(
  empleado: Empleado,
  solicitudes: readonly Solicitud[],
  anio: number
): number {
  const diasAprobados = solicitudes
    .filter(
      (s) =>
        s.empleadoId === empleado.id &&
        s.estado === 'aprobada' &&
        s.fechaInicio.getFullYear() === anio
    )
    .reduce((total, s) => total + s.cantidadDias, 0);

  return empleado.saldoAnual - diasAprobados;
}

// ============================================================================
// Transiciones de estado
// Todas devuelven la solicitud actualizada COMPLETA y no mutan sus
// argumentos: construyen un objeto nuevo.
// ============================================================================

/**
 * Aprueba una solicitud pendiente.
 * Falla si la solicitud no está pendiente o si el saldo disponible del
 * empleado (para el año de la fecha de inicio) es menor a los días pedidos.
 */
export function aprobar(
  solicitud: Solicitud,
  empleado: Empleado,
  solicitudes: readonly Solicitud[],
  revisadaPor: string,
  fechaRevision: Date = new Date()
): Resultado<SolicitudAprobada> {
  if (solicitud.estado !== 'pendiente') {
    return fallo(
      `No se puede aprobar: la solicitud ya está en estado "${solicitud.estado}"`
    );
  }

  const anio = solicitud.fechaInicio.getFullYear();
  const disponibles = diasDisponibles(empleado, solicitudes, anio);

  if (disponibles < solicitud.cantidadDias) {
    return fallo(
      `Saldo insuficiente: dispone de ${disponibles} día(s) y solicita ${solicitud.cantidadDias}`
    );
  }

  return exito({
    ...solicitud,
    estado: 'aprobada',
    revisadaPor,
    revisadaEn: fechaRevision,
  });
}

/**
 * Rechaza una solicitud pendiente, con motivo obligatorio no vacío.
 * No se puede rechazar una ya procesada (aprobada/rechazada) ni una
 * cancelada.
 */
export function rechazar(
  solicitud: Solicitud,
  revisadaPor: string,
  motivo: string,
  fechaRevision: Date = new Date()
): Resultado<SolicitudRechazada> {
  if (solicitud.estado === 'aprobada' || solicitud.estado === 'rechazada') {
    return fallo(
      `No se puede rechazar: la solicitud ya fue procesada ("${solicitud.estado}")`
    );
  }
  if (solicitud.estado === 'cancelada') {
    return fallo('No se puede rechazar una solicitud cancelada');
  }
  if (motivo.trim() === '') {
    return fallo('El motivo de rechazo es obligatorio y no puede estar vacío');
  }

  return exito({
    ...solicitud,
    estado: 'rechazada',
    motivo,
    revisadaPor,
    revisadaEn: fechaRevision,
  });
}

/**
 * Cancela una solicitud. Solo se permite sobre pendientes o aprobadas.
 *
 * DECISIÓN EXPLÍCITA: cancelar una solicitud APROBADA sí devuelve los
 * días al empleado. No hace falta "sumar" nada: como `diasDisponibles`
 * se calcula únicamente sobre solicitudes ACTUALMENTE aprobadas, al pasar
 * esta a 'cancelada' deja de descontar y el saldo se recupera solo.
 */
export function cancelar(
  solicitud: Solicitud
): Resultado<SolicitudCancelada> {
  if (solicitud.estado !== 'pendiente' && solicitud.estado !== 'aprobada') {
    return fallo(
      `No se puede cancelar: la solicitud está en estado "${solicitud.estado}"`
    );
  }

  // Se reconstruye desde los campos base para que una aprobada cancelada
  // no arrastre los campos de revisión (que 'cancelada' no permite).
  return exito({
    id: solicitud.id,
    empleadoId: solicitud.empleadoId,
    fechaInicio: solicitud.fechaInicio,
    fechaFin: solicitud.fechaFin,
    cantidadDias: solicitud.cantidadDias,
    estado: 'cancelada',
  });
}