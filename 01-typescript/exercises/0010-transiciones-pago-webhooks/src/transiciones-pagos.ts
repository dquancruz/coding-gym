// ============================================================
// Types
// ============================================================

export type Reembolso = { monto: number; en: Date };

export type EstadoPago =
  | { status: 'creado' }
  | { status: 'autorizado'; authCode: string; montoAutorizado: number }
  | { status: 'capturado'; montoCapturado: number; capturadoEn: Date }
  | {
      status: 'parcialmente_reembolsado';
      montoCapturado: number;
      montoReembolsado: number;
      reembolsos: Reembolso[];
    }
  | {
      status: 'reembolsado';
      montoCapturado: number;
      montoReembolsado: number;
      reembolsos: Reembolso[];
    }
  | { status: 'fallido'; motivo: string; en: Date };

export type EventoGateway =
  | { type: 'autorizacion_exitosa'; authCode: string; monto: number; en: Date }
  | { type: 'autorizacion_fallida'; motivo: string; en: Date }
  | { type: 'captura_exitosa'; monto: number; en: Date }
  | { type: 'captura_fallida'; motivo: string; en: Date }
  | { type: 'reembolso_emitido'; monto: number; en: Date };

// ============================================================
// Resultado de transición
// ============================================================

// DECISIÓN: tipo Resultado, no throw.
// Esto corre dentro de un handler de webhook HTTP. Una transición inválida
// NO es un bug del servidor: es un evento que el gateway mandó y que nuestras
// reglas rechazan. Si tiramos excepción, el handler devuelve 500, el gateway
// lo interpreta como "no lo recibiste" y REINTENTA — el mismo evento inválido
// va a volver en loop hasta que se rinda. Con un Resultado explícito podemos
// responder 200 (evento recibido y evaluado, no reintentes) y loggear el
// rechazo para auditoría. El throw queda reservado para fallas reales de
// infra (DB caída), donde el 500 + reintento del gateway.
export type Resultado<T> =
  | { ok: true; valor: T }
  | { ok: false; motivo: string };

const ok = (estado: EstadoPago): Resultado<EstadoPago> => ({
  ok: true,
  valor: estado,
});
const err = (motivo: string): Resultado<EstadoPago> => ({ ok: false, motivo });

// ============================================================
// Parsing de unknown
// ============================================================

function esObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function esString(v: unknown): v is string {
  return typeof v === 'string';
}

// Number.isFinite descarta NaN e Infinity, que sí son typeof 'number'.
function esNumero(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

// El JSON crudo no tiene Date: viene como string ISO (o epoch ms).
// Aceptamos ambos y descartamos fechas inválidas (new Date('banana') → NaN).
function aFecha(v: unknown): Date | null {
  if (esString(v) || esNumero(v)) {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function parsearEventoGateway(raw: unknown): EventoGateway | null {
  if (!esObjeto(raw)) return null;

  const { type } = raw;
  if (!esString(type)) return null;

  const en = aFecha(raw.en);
  if (en === null) return null;

  switch (type) {
    case 'autorizacion_exitosa': {
      const { authCode, monto } = raw;
      if (!esString(authCode) || !esNumero(monto) || monto <= 0) return null;
      return { type, authCode, monto, en };
    }

    case 'autorizacion_fallida':
    case 'captura_fallida': {
      const { motivo } = raw;
      if (!esString(motivo)) return null;
      return { type, motivo, en };
    }

    case 'captura_exitosa':
    case 'reembolso_emitido': {
      const { monto } = raw;
      if (!esNumero(monto) || monto <= 0) return null;
      return { type, monto, en };
    }

    default:
      // `type` desconocido → null. No lanzamos: es input no confiable.
      return null;
  }
}

// ============================================================
// Tabla de transiciones (stretch goal)
// ============================================================

type EstadoTag = EstadoPago['status'];
type EventoTag = EventoGateway['type'];

// Record<EstadoTag, Record<EventoTag, boolean>> obliga a que agregar un
// estado o un evento nuevo sin actualizar esta tabla sea error de compilación.
const TABLA_TRANSICIONES: Record<EstadoTag, Record<EventoTag, boolean>> = {
  creado: {
    autorizacion_exitosa: true,
    autorizacion_fallida: true,
    captura_exitosa: false,
    captura_fallida: false,
    reembolso_emitido: false,
  },
  autorizado: {
    autorizacion_exitosa: false,
    autorizacion_fallida: false,
    captura_exitosa: true,
    captura_fallida: true,
    reembolso_emitido: false,
  },
  capturado: {
    autorizacion_exitosa: false,
    autorizacion_fallida: false,
    captura_exitosa: true, // duplicado → no-op idempotente, ver aplicarEvento
    captura_fallida: false,
    reembolso_emitido: true,
  },
  parcialmente_reembolsado: {
    autorizacion_exitosa: false,
    autorizacion_fallida: false,
    captura_exitosa: false,
    captura_fallida: false,
    reembolso_emitido: true,
  },
  reembolsado: {
    autorizacion_exitosa: false,
    autorizacion_fallida: false,
    captura_exitosa: false,
    captura_fallida: false,
    reembolso_emitido: false,
  },
  fallido: {
    autorizacion_exitosa: false,
    autorizacion_fallida: false,
    captura_exitosa: false,
    captura_fallida: false,
    reembolso_emitido: false,
  },
};

export function canTransition(from: EstadoTag, eventType: EventoTag): boolean {
  return TABLA_TRANSICIONES[from][eventType];
}

// ============================================================
// Transición
// ============================================================

function nunca(x: never): never {
  throw new Error(`Caso no manejado: ${JSON.stringify(x)}`);
}

// DECISIÓN DE IDEMPOTENCIA: no-op idempotente para reintentos de eventos de
// ESTADO (autorizacion/captura), transición inválida para reembolsos duplicados.
//
// Por qué la asimetría: un `captura_exitosa` repetido sobre un pago ya
// `capturado` es semánticamente el mismo hecho — el gateway solo captura una
// vez, el segundo webhook es su reintento. Tratarlo como inválido nos haría
// alertar sobre algo perfectamente normal. Devolvemos el estado sin tocar.
//
// Los reembolsos son distintos: DOS reembolsos legítimos de $50 sobre una
// captura de $100 son un caso real de negocio, así que no puedo tratar
// "monto igual al anterior" como duplicado sin arriesgarme a perder plata real.
// El invariante suma(reembolsos) <= montoCapturado es la red de contención,
// y es exactamente lo que falló en el incidente. Para deduplicar reembolsos de
// verdad hace falta un `eventId` del gateway persistido — ver comentario al final.
export function aplicarEvento(
  estado: EstadoPago,
  evento: EventoGateway,
): Resultado<EstadoPago> {
  if (!canTransition(estado.status, evento.type)) {
    return err(
      `Transición inválida: evento '${evento.type}' sobre estado '${estado.status}'`,
    );
  }

  switch (evento.type) {
    case 'autorizacion_exitosa': {
      // canTransition ya garantizó estado.status === 'creado'
      return ok({
        status: 'autorizado',
        authCode: evento.authCode,
        montoAutorizado: evento.monto,
      });
    }

    case 'autorizacion_fallida':
    case 'captura_fallida': {
      return ok({ status: 'fallido', motivo: evento.motivo, en: evento.en });
    }

    case 'captura_exitosa': {
      // Reintento del gateway sobre un pago ya capturado → no-op.
      if (estado.status === 'capturado') return ok(estado);

      if (estado.status !== 'autorizado') {
        return err('No se puede capturar un pago que no está autorizado');
      }
      if (evento.monto > estado.montoAutorizado) {
        return err(
          `Captura de ${evento.monto} excede lo autorizado (${estado.montoAutorizado})`,
        );
      }
      return ok({
        status: 'capturado',
        montoCapturado: evento.monto,
        capturadoEn: evento.en,
      });
    }

    case 'reembolso_emitido': {
      if (
        estado.status !== 'capturado' &&
        estado.status !== 'parcialmente_reembolsado'
      ) {
        return err(
          'Solo se puede reembolsar un pago capturado o parcialmente reembolsado',
        );
      }

      const yaReembolsado =
        estado.status === 'parcialmente_reembolsado'
          ? estado.montoReembolsado
          : 0;
      const reembolsosPrevios =
        estado.status === 'parcialmente_reembolsado' ? estado.reembolsos : [];

      const nuevoTotal = yaReembolsado + evento.monto;

      // EL INVARIANTE DEL INCIDENTE: nunca reembolsar más de lo capturado.
      if (nuevoTotal > estado.montoCapturado) {
        return err(
          `Reembolso de ${evento.monto} excede lo capturado: ` +
            `${yaReembolsado} + ${evento.monto} > ${estado.montoCapturado}`,
        );
      }

      const reembolsos: Reembolso[] = [
        ...reembolsosPrevios,
        { monto: evento.monto, en: evento.en },
      ];

      // Igualdad exacta → terminal `reembolsado`, no parcial.
      const status =
        nuevoTotal === estado.montoCapturado
          ? ('reembolsado' as const)
          : ('parcialmente_reembolsado' as const);

      return ok({
        status,
        montoCapturado: estado.montoCapturado,
        montoReembolsado: nuevoTotal,
        reembolsos,
      });
    }

    default:
      // Exhaustividad: agregar un 6to tipo de evento sin manejarlo acá
      // rompe la compilación, porque `evento` deja de ser `never`.
      return nunca(evento);
  }
}

// ============================================================
// AUDITORÍA (stretch goal — no implementado)
// ============================================================
// En cada llamada a aplicarEvento loggearía, en una tabla append-only:
//   { paymentId, eventId (el del gateway, para detectar reintentos),
//     estadoAnterior: estado.status, estadoNuevo, tipoEvento, monto,
//     montoCapturado, montoReembolsadoAcumulado, resultado: 'ok' | motivo,
//     recibidoEn, aplicadoEn }
// Los dos que importan para el incidente: `eventId` (con un UNIQUE sobre
// (paymentId, eventId) el reembolso duplicado se rechaza en la DB, no en la
// lógica) y `montoReembolsadoAcumulado` (finance ve la suma corriendo en cada
// fila y detecta la desviación el mismo día, no al cerrar el mes). Loggear
// también los rechazos, no solo los éxitos: un reembolso rechazado por exceder
// el capturado es justamente la señal que nadie vio la primera vez.