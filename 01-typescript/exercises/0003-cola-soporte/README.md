# Cola de tickets de soporte, sin pistas

- **Track / Skill:** TypeScript / tipos básicos (interfaces, unions, intersecciones)
- **Nivel objetivo:** 🟨
- **Tiempo estimado:** 1.5h

## Contexto
Una startup de soporte técnico maneja sus tickets en una cola compartida entre
agentes. Hoy todo vive en objetos sueltos sin tipar, y ya pasaron cosas raras:
un ticket "cerrado" se reabrió con los datos de otro agente pegados encima, y
un cálculo de carga de trabajo contó tickets duplicados. Te piden modelar el
dominio en TypeScript e implementar las operaciones core de la cola antes de
que el equipo siga construyendo sobre esto.

## Requisitos (criterios de aceptación)
- [ ] Modela un ticket de soporte con, como mínimo: identificador único,
      título, prioridad (unión de literales, al menos 4 niveles) y estado
      (unión de literales que distinga al menos "abierto", "asignado",
      "resuelto" y "cerrado").
- [ ] Un ticket asignado tiene además el agente responsable y la fecha/hora de
      asignación — modela esto **componiendo tipos** (no repitas los campos a
      mano en una interface nueva).
- [ ] Implementa la lógica para **asignar** un ticket a un agente. Decidí vos
      qué pasa si el ticket ya estaba asignado a otro agente (reasignación) y
      qué pasa si intentás asignar un ticket que ya está cerrado — ninguno de
      los dos casos debería pasar en silencio.
- [ ] Implementa la lógica para **resolver** un ticket. Un ticket no puede
      resolverse si nunca fue asignado a nadie.
- [ ] Implementa una función que calcule la **carga de trabajo** (cantidad de
      tickets abiertos o asignados, sin contar resueltos ni cerrados) por
      agente.
- [ ] Ninguna función debe mutar sus argumentos.
- [ ] No debe haber ningún `any` explícito ni implícito.
- [ ] Tests que cubran al menos: caso feliz de asignar y luego resolver, el
      intento de resolver un ticket sin asignar, el intento de asignar un
      ticket cerrado, y la reasignación de un ticket ya asignado.
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

## Sin pistas (nivel 🟨)
Este ejercicio no trae pistas de implementación ni firmas armadas. Si te
trabas, es una señal de qué repasar — no un hueco en el enunciado.

## Stretch goals (opcional, para empujar a mid)
- Modela el estado como **discriminated union** en vez de una sola interface
  con un campo `estado` suelto (ej. un ticket resuelto podría necesitar un
  campo `resueltoEn` que no tiene sentido en un ticket abierto).
- Función para **reabrir** un ticket cerrado — decidí qué reglas aplican
  (¿se pierde el agente asignado? ¿se conserva el historial de asignación?).
