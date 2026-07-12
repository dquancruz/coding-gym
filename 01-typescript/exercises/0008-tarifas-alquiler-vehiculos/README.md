# Tarifas de alquiler de vehículos por minuto
- **Track / Skill:** TypeScript / basic types (interfaces, unions, intersections) — hacia el `level up` (necesitás 2 🟩 consecutivos más en este skill)
- **Target level:** 🟩 (ya practicado varias veces — sin hints)
- **Estimated time:** 1.5h

## Context
Trabajás en el backend de una app de movilidad urbana (bicicletas, scooters
y patinetas eléctricas por minuto). Te piden modelar el cálculo de costo de
una reserva ya finalizada: cuánto cobrarle al usuario según el vehículo que
usó, su membresía, si hubo tarifa surge (hora pico), y un código de promoción
que llega desde un formulario legacy sin ningún tipo — puede venir vacío,
mal escrito, en minúsculas, o directamente basura.

También necesitás una función para generar el recibo, que en el sistema
actual se llama desde dos lugares distintos con argumentos distintos: a
veces con la reserva completa, a veces solo con el monto ya calculado y la
moneda (un cron de reintentos que ya perdió el objeto `Reserva` original).

## Requirements (acceptance criteria)
- [ ] Interface `Vehiculo`: `id` (string), `tipo: 'bicicleta' | 'scooter' | 'patineta'`,
      `bateriaPct` (number, opcional — no aplica a `'bicicleta'`).
- [ ] Interface `Usuario`: `id` (string), `nombre` (string),
      `membresia: 'basica' | 'premium'` (`'premium'` obtiene 20% de descuento).
- [ ] Interface `Reserva`: `id` (string), `vehiculoId` (string), `usuarioId`
      (string), `minutos` (number), `codigoPromo: unknown` (llega crudo del
      formulario legacy — a propósito no está tipado como `string`).
- [ ] Interface `TarifaBase`: `precioPorMinuto` (number).
- [ ] Tipo `TarifaConSurge = TarifaBase & { multiplicadorSurge: number }`
      (intersección — no repitas `precioPorMinuto` a mano).
- [ ] `calcularCostoFinal(reserva: Reserva, vehiculo: Vehiculo, usuario: Usuario, tarifa: TarifaBase | TarifaConSurge): number`
  - Antes de calcular nada, valida que `reserva.vehiculoId === vehiculo.id`
    Y `reserva.usuarioId === usuario.id`. Si alguna de las dos relaciones no
    coincide, falla explícitamente (vos elegís el mecanismo: throw o un tipo
    Resultado — justificá la elección).
  - Costo base = `tarifa.precioPorMinuto * reserva.minutos`.
  - Si `tarifa` trae `multiplicadorSurge`, aplicalo (tenés que angostar el
    tipo unión `TarifaBase | TarifaConSurge` para saber si está presente —
    no asumas que siempre existe).
  - Si `usuario.membresia === 'premium'`, aplicá 20% de descuento sobre el
    resultado anterior.
  - `reserva.codigoPromo` puede ser literalmente cualquier cosa (viene de
    `unknown`). Escribí un type guard `esCodigoPromoValido(x: unknown): x is CodigoPromo`
    donde `CodigoPromo = 'BLACK10' | 'SUMMER15'`. Si es válido, aplicá el
    descuento correspondiente (10% o 15%) además del de membresía. Si no es
    válido — `undefined`, `null`, número, objeto, string que no matchea, lo
    que sea — **ignoralo silenciosamente**, nunca lances una excepción por
    un código de promo mal formado.
- [ ] `formatearRecibo` con **overloads** (dos firmas, una sola
      implementación):
  - `formatearRecibo(reserva: Reserva, costoFinal: number): string` — recibo
    detallado que incluye `reserva.id`.
  - `formatearRecibo(costoFinal: number, moneda: string): string` — recibo
    simple sin id de reserva.
- [ ] Cero `any`, explícito o implícito. `unknown` es el único tipo
      permitido para `codigoPromo` antes de angostarlo.
- [ ] Tests que cubran al menos:
  - costo feliz sin surge, sin promo, membresía básica
  - costo con surge aplicado
  - descuento premium aplicado
  - `codigoPromo` válido (`'BLACK10'` y `'SUMMER15'`) aplicando su descuento
  - `codigoPromo` inválido/basura (probá al menos 3 casos: `undefined`,
    número, string que no matchea) — debe ignorarse, **nunca** lanzar
  - `reserva.vehiculoId` que no coincide con `vehiculo.id` → falla explícita
  - `reserva.usuarioId` que no coincide con `usuario.id` → falla explícita
    (caso distinto al anterior — las dos relaciones se validan por separado)
  - ambas firmas de `formatearRecibo` (con reserva y con costo+moneda)

## Constraints
- TypeScript puro, sin librerías externas (nada de Zod acá — la validación
  de `codigoPromo` es un type guard manual, no un schema).
- Debe compilar sin errores con `strict: true` y `noImplicitAny`.
- No hay firmas de función dadas más allá de las especificadas arriba —
  completá el resto vos.

## Stretch goals (optional, to push toward the next level)
- El código de promo llega a veces en minúsculas (`'black10'`) desde un
  formulario viejo. Decidí si `esCodigoPromoValido` debería aceptar eso
  normalizando el string primero, o si es una señal de que el dato está
  corrupto y debe rechazarse — documentá la decisión en 2-3 líneas.
- Agregá una tercera membresía (`'corporativa'`, descuento variable según
  una lista de empresas) sin romper la exhaustividad de lo que ya tenés.
