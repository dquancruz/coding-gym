# Bitácora

> Formato por entrada (Claude Code la añade tras cada `revisar`):
>
> ## YYYY-MM-DD — [Track] NNNN Título — veredicto (🟥/🟨/🟩)
> **Nota:** Correctitud X · Legibilidad X · Idiomático X · Tests X · Errores X · Diseño X · Rendimiento X · Explicación X
> **Aprendí:** ...
> **A mejorar:** ...
> **Siguiente refactor sugerido:** ...

---

## 2026-07-01 — [TypeScript] 0001 catalogo-carrito — veredicto (🟥)
**Nota:** Correctitud 1 · Legibilidad 2 · Idiomático 2 · Tests 1 · Errores 2 · Diseño 1 · Rendimiento 3 · Explicación 1
**Aprendí:** `interface Product` bien tipado, unión de literales en `estado` correcta, cero `any` (verificado con `tsc --strict`). `applyDiscount` y `calculateTotal` están bien resueltos con spread/reduce inmutables.
**A mejorar:** `CartItem` no es la intersección pedida (`Product & { cantidad: number }`) — quedó como interface anidada (`{ product, quantity }`), que evita justo el ejercicio de componer tipos con `&`. `addToCart` no cumple ni la firma (`cart: CartItem[], product, cantidad`) ni el comportamiento (sumar cantidad si ya existe, devolver array nuevo): recibe un solo `CartItem` en vez de un array, y devuelve `CartItem | String` — el `String` con mayúscula es el wrapper-object, no el primitivo `string`.
**Siguiente refactor sugerido:** Reescribir `CartItem` como `type CartItem = Product & { cantidad: number }` y reimplementar `addToCart` buscando con `.find()`/`.map()` sobre el array para sumar cantidades o agregar el item, devolviendo siempre un array nuevo.

## 2026-07-01 — [TypeScript] 0001 catalogo-carrito (corrección) — veredicto (🟥, resuelto con guía)
**Nota:** Correctitud 3 · Legibilidad 3 · Idiomático 3 · Tests 1 · Errores 2 · Diseño 3 · Rendimiento 3 · Explicación 1
**Aprendí:** Aplicó correctamente `CartItem = Product & { quantity: number }` y reescribió `addToCart` con la firma y comportamiento pedidos (`.some()` + `.map()`/spread, sin mutar, suma cantidad si ya existe). Compila limpio en `strict`, sin `any`.
**A mejorar:** La corrección siguió casi textualmente el fix que le di en la revisión anterior — no fue resuelto de cero sin pistas, así que no cuenta como demostración de nivel 🟨. Sigue usando nombres de campo en inglés (`name`/`price`/`state`) en vez de los pedidos en el enunciado (`nombre`/`precio`/`estado`).
**Siguiente refactor sugerido:** Para contar hacia el ascenso, resolver el próximo ejercicio de intersecciones/firmas de función sin que yo dé el código de corrección — solo señalar el error y dejar que lo modele solo.

## 2026-07-02 — [TypeScript] 0002 reservas-gimnasio — veredicto (🟥)
**Nota:** Correctitud 2 · Legibilidad 3 · Idiomático 3 · Tests 2 · Errores 3 · Diseño 3 · Rendimiento 3 · Explicación 2
**Aprendí:** `ClassSession`/`Booking` bien modelados (interface + intersección `&` sin repetir campos a mano), unión de literales correcta en `estado`. Compila limpio en `strict`, cero `any` (verificado con `tsc --strict --noImplicitAny`). `totalAttendees` y `cancelSession` son correctos e inmutables (`Readonly<ClassSession>` en la firma, verificado con test que confirma que el objeto original no muta). Validación de `personas <= 0` con `Error` explícito, stretch goal cumplido.
**A mejorar:** `bookSession` tiene un bug de correctitud en el criterio de aceptación central: el `.some()`/`.map()` que decide si "ya existe una reserva" compara solo `item.id === session.id`, ignorando `cliente`. Efecto verificado ejecutando el código: si Carlos reserva 2 personas en yoga-101 y luego Ana reserva 3 personas en la misma sesión, la reserva de Carlos se **pierde silenciosamente** (queda solo la de Ana) en vez de coexistir como dos reservas separadas. Además, incluso cuando sí es el mismo cliente repitiendo reserva, el código *reemplaza* `personas` en vez de sumarla (`personas: personas` en vez de `item.personas + personas`), violando literalmente el enunciado ("suma personas a esa reserva"). El archivo `tests/manual.ts` no detectó nada de esto porque nunca llama a `bookSession` dos veces sobre la misma sesión — los 3 casos de prueba cubren creación simple, error de validación, y funciones que ni siquiera pasan por `bookSession`. Es el mismo tipo de vacío que en 0001: la lógica de "¿ya existe?" necesita la clave compuesta completa, no solo un campo.
**Siguiente refactor sugerido:**
```ts
// Antes — solo compara session.id, pierde reservas de otros clientes y no suma
const existe = bookings.some(item => item.id === session.id);
if (!existe) {
    return [...bookings, { ...session, cliente, personas }];
} else {
    return bookings.map(item =>
        item.id === session.id
            ? { ...item, cliente: cliente, personas: personas }
            : item
    );
}

// Después — la clave es (session.id, cliente); suma en vez de reemplazar
const existente = bookings.find(
    item => item.id === session.id && item.cliente === cliente
);
if (!existente) {
    return [...bookings, { ...session, cliente, personas }];
}
return bookings.map(item =>
    item === existente
        ? { ...item, personas: item.personas + personas }
        : item
);
```
Después de aplicar el fix, agregar a `tests/manual.ts` los dos casos que lo hubieran atrapado: (a) mismo cliente reserva dos veces la misma sesión → `personas` debe sumar; (b) dos clientes distintos reservan la misma sesión → deben quedar dos `Booking` separadas, no una sobreescrita.

## 2026-07-02 — [TypeScript] 0002 reservas-gimnasio (corrección 1) — veredicto (🟥, fix parcial)
**Nota:** Correctitud 2 · Legibilidad 3 · Idiomático 3 · Tests 3 · Errores 3 · Diseño 3 · Rendimiento 3 · Explicación 2
**Aprendí:** Agregó exactamente los dos casos de prueba sugeridos (acumulación mismo cliente, separación de clientes distintos) y ambos pasan — buena señal de que entendió el criterio de aceptación. Arregló el `.find()` de la línea 21 para usar la clave compuesta `id + cliente`.
**A mejorar:** El fix quedó a medias: arregló el `find` que *decide si existe*, pero no el `.map()` que *hace la actualización* — ese sigue comparando solo `item.id === session.id`. Verifiqué ejecutando un tercer escenario que ni el ejercicio ni la corrección anterior cubrían: dos clientes ya con reservas separadas en la misma sesión (Carlos=2, Ana=3), y uno de ellos (Carlos) vuelve a reservar 4 más. Resultado real: el `.map()` matchea las DOS filas por tener el mismo `session.id`, así que la fila de Ana queda sobreescrita con `cliente: 'Carlos'` (por el `cliente: cliente` fijo en el spread) y `personas: 7`, y además se crea una fila nueva para Carlos con `personas: 6` — total 13 en vez de 9, y la reserva de Ana quedó corrompida. Patrón: cuando ya tienes la referencia exacta al elemento encontrado (`existe`), compárala por identidad (`item === existe`) en vez de repetir una condición parcial en el `map`.
**Siguiente refactor sugerido:**
```ts
// Antes
return bookings.map(item =>
    item.id === session.id
        ? { ...item, cliente: cliente, personas: item.personas + personas }
        : item
);

// Después — misma clave que `existe`, comparando por identidad
return bookings.map(item =>
    item === existe
        ? { ...item, personas: item.personas + personas }
        : item
);
```
Agregar un tercer caso a `manual.ts`: dos clientes con reservas separadas en la misma sesión, uno de ellos vuelve a reservar — verificar que la fila del otro cliente no se toque.

## 2026-07-02 — [TypeScript] 0002 reservas-gimnasio (corrección 2) — veredicto (🟨)
**Nota:** Correctitud 4 · Legibilidad 3 · Idiomático 4 · Tests 3 · Errores 3 · Diseño 3 · Rendimiento 3 · Explicación 2
**Aprendí:** `item === existe` resolvió el bug de raíz — verifiqué ejecutando el escenario que rompió la corrección anterior (Carlos=2, Ana=3, Carlos reserva 4 más): da Carlos=6, Ana=3, dos filas, sin corrupción. Compila limpio en `strict --noImplicitAny`, cero `any`. `totalAttendees`/`cancelSession` siguen correctos e inmutables. Buena reacción al feedback: entendió por qué comparar por identidad resuelve tanto el bug de "cliente equivocado" como el de "reemplaza en vez de suma" con un solo cambio.
**A mejorar:** No agregó el tercer caso de test sugerido (dos clientes separados + uno rebookea) — justo el que hubiera detectado el bug de la corrección anterior; la suite queda sin blindaje contra una regresión ahí. `cliente: cliente` en el spread de la línea 28 quedó redundante (dead weight, no bug) tras el cambio a `item === existe`. Los comentarios (`// 1. Aplicamos Readonly...`, `// Corregimos el .reduce...`) documentan el proceso de corrección en vez del razonamiento de diseño — para mid necesito ver el *por qué* de las decisiones (ej. por qué comparar por identidad, por qué lanzar error en `personas <= 0` en vez de ignorar silenciosamente), no un historial de parches.
**Siguiente refactor sugerido:** Quitar `cliente: cliente` redundante en la línea 28. Agregar el tercer test (clientes separados + rebooking) a `manual.ts`. La próxima vez que corrijas algo, reemplaza el comentario tipo bitácora por una línea que explique la decisión de diseño, no el cambio realizado.
