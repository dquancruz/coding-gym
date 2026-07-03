# Reservas de un gimnasio sin `any`

- **Track / Skill:** TypeScript / tipos básicos (interfaces, unions, intersecciones)
- **Nivel objetivo:** 🟥
- **Tiempo estimado:** 1h

## Contexto
El gimnasio donde entrenas digitalizó las reservas de clases (yoga, spinning,
funcional). El sistema actual mezcla la info de la clase con la de quién
reserva en objetos armados a mano, y ya hubo un bug donde una reserva se guardó
sin `personas`, rompiendo el conteo de asistentes. Te piden modelar esto en
TypeScript, sin `any`, antes de seguir agregando funcionalidad.

## Requisitos (criterios de aceptación)
- [ ] Define una `interface ClassSession` con: `id` (string), `nombre` (string),
      `cupoMaximo` (number), y `estado`, que debe ser una **unión de
      literales**: `'scheduled' | 'cancelled' | 'completed'`.
- [ ] Define un `type Booking` que sea la **intersección** de `ClassSession` y
      `{ cliente: string; personas: number }` (no repitas los campos a mano).
- [ ] Implementa
      `bookSession(bookings: Booking[], session: ClassSession, cliente: string, personas: number): Booking[]`
      — si el mismo `cliente` ya tiene una reserva para ese `session.id`, suma
      `personas` a esa reserva; si no, agrega una nueva. No debe mutar el
      array `bookings` original (debe devolver uno nuevo).
- [ ] Implementa `totalAttendees(bookings: Booking[]): number` que sume
      `personas` de todas las reservas.
- [ ] Implementa `cancelSession(session: ClassSession): ClassSession` que
      devuelva un **nuevo** objeto con `estado: 'cancelled'`, sin mutar el
      `session` original.
- [ ] No debe haber ningún `any` explícito ni implícito en tu código (revisa
      que tampoco dependas de inferencia laxa — sé explícito en las firmas de
      función).

## Restricciones
- TypeScript puro, sin librerías externas (ni siquiera para tests todavía).
- Debe compilar sin errores con `strict: true`.

## Pistas (nivel 🟥)
- `type` es obligatorio para uniones e intersecciones (`|`, `&`) — una
  intersección junta los campos de ambos tipos en el mismo nivel, no anida un
  tipo dentro del otro.
- Para "no mutar", usa spread (`{ ...obj }`) o `.map()`/`.filter()` en vez de
  `push`/reasignación directa de propiedades.
- Piensa bien el orden y los tipos de los parámetros de `bookSession` antes de
  escribir el cuerpo — la firma exacta importa, no solo que "funcione".
- Si usas `String`, `Number` o `Boolean` con mayúscula como tipo, te
  equivocaste: en TypeScript los primitivos son `string`, `number`, `boolean`.

## Stretch goals (opcional, para empujar a mid)
- Valida que `personas > 0` en `bookSession`; si no, decide (y justifica) qué
  hacer: ¿lanzar error, ignorar la reserva, devolver el mismo array?
- Usa `Readonly<ClassSession>` en las firmas para dejar explícito por tipos
  que las funciones no mutan su entrada.
- Escribe 2-3 casos de prueba simples (aunque sea con `console.assert` o un
  archivo `tests/manual.ts` que ejecutes con `ts-node`).
