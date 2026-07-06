# Solicitudes de vacaciones, sin pistas

- **Track / Skill:** TypeScript / tipos básicos (interfaces, unions, intersecciones)
- **Nivel objetivo:** 🟩
- **Tiempo estimado:** 1.5h

## Contexto
El área de RRHH de una empresa maneja las solicitudes de vacaciones de sus
empleados en una planilla. Cada empleado tiene un saldo de días disponibles
por año, y ya hubo un incidente: un gerente aprobó una solicitud que dejaba a
un empleado con saldo negativo, y otra vez se "canceló" una solicitud que ya
había sido rechazada, como si eso tuviera sentido. Te piden modelar el
dominio en TypeScript e implementar las operaciones core antes de que el
equipo de plataforma construya una UI sobre esto.

## Requisitos (criterios de aceptación)
- [ ] Modela un empleado con, como mínimo: identificador único, nombre y
      saldo de días de vacaciones disponibles por año.
- [ ] Modela una solicitud de vacaciones con, como mínimo: identificador
      único, empleado solicitante, fecha de inicio, fecha de fin (ambas como
      `Date`), cantidad de días solicitados y estado (unión de literales que
      distinga al menos "pendiente", "aprobada", "rechazada" y "cancelada").
- [ ] Una solicitud **procesada** (aprobada o rechazada) tiene además quién
      la revisó y cuándo — modela esto **componiendo tipos** (no repitas los
      campos a mano en una interface nueva).
- [ ] Una solicitud **rechazada** requiere un motivo (string no vacío); una
      solicitud pendiente o cancelada no debería poder tener motivo de
      rechazo. Decidí cómo tipar esto para que sea imposible representar un
      estado inválido (ej. "rechazada" sin motivo).
- [ ] Implementa la lógica para **aprobar** una solicitud. No se puede
      aprobar si el saldo disponible del empleado (días totales menos la
      suma de días de sus solicitudes ya **aprobadas** para ese año) es
      menor a los días solicitados. Tampoco se puede aprobar una solicitud
      que ya fue procesada.
- [ ] Implementa la lógica para **rechazar** una solicitud, con motivo
      obligatorio. No se puede rechazar una solicitud ya procesada.
- [ ] Implementa la lógica para **cancelar** una solicitud. Solo se puede
      cancelar una solicitud pendiente o aprobada (no una ya rechazada ni
      una ya cancelada). Decidí si cancelar una solicitud aprobada le
      devuelve los días al saldo del empleado y dejá esa decisión explícita
      en el código o en un comentario.
- [ ] Implementa una función que calcule los **días disponibles** de un
      empleado a partir de su saldo total y sus solicitudes — debe basarse
      únicamente en solicitudes **actualmente aprobadas**, nunca en un
      historial de todas las solicitudes que pasaron por ese estado alguna
      vez.
- [ ] Las funciones que cambian de estado (aprobar/rechazar/cancelar) deben
      devolver la solicitud actualizada completa — quien las llama no debe
      tener que reconstruir el nuevo estado a mano combinando varios
      resultados.
- [ ] Ninguna función debe mutar sus argumentos.
- [ ] No debe haber ningún `any` explícito ni implícito.
- [ ] Tests que cubran al menos: caso feliz de aprobar dentro del saldo, el
      intento de aprobar excediendo el saldo disponible, el intento de
      procesar (aprobar o rechazar) una solicitud ya procesada, rechazar sin
      motivo, y cancelar una solicitud aprobada (verificando qué pasa con el
      saldo según la decisión que tomaste).
- [ ] Manejo de errores explícito para las operaciones inválidas que
      identifiques arriba. Vos elegís el mecanismo (excepción, resultado con
      unión discriminada, etc.) — pero **justificá la elección** en un
      comentario breve o en tus notas de intento. Esto es parte de la
      corrección, no un extra.

## Restricciones
- TypeScript puro, sin librerías externas (ni siquiera para tests todavía).
- Debe compilar sin errores con `strict: true`.
- No hay firmas de función dadas: vos decidís nombres de campos, tipos y
  funciones. Sé consistente y que cada nombre comunique la intención.

## Sin pistas (nivel 🟩)
Este ejercicio no trae pistas de implementación ni firmas armadas. Si te
trabas, es una señal de qué repasar — no un hueco en el enunciado.

## Stretch goals (opcional, para empujar a senior)
- Modela el estado como **discriminated union** en vez de una sola interface
  con un campo `estado` suelto y campos opcionales sueltos (`motivoRechazo?`,
  `revisadoPor?`) — que el compilador rechace, por construcción, una
  solicitud "rechazada" sin motivo o una "pendiente" con revisor.
- ¿Qué pasa si dos solicitudes del mismo empleado se superponen en fechas?
  Documentá la decisión (¿se permite, se bloquea, se avisa?) aunque no la
  implementes, como si fuera una sección de "Alternativas descartadas" de un
  RFC breve.
