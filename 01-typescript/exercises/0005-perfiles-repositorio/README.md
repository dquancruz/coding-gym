# Perfiles de usuario: repositorio genérico y utility types

- **Track / Skill:** TypeScript / generics y utility types (`Partial`, `Pick`, `Omit`, `Record`)
- **Target level:** 🟥 (primera práctica de este skill — sin confirmar todavía)
- **Estimated time:** 1h

## Contexto
El panel de administración va a necesitar guardar y editar varios tipos de
entidades (perfiles de usuario, y más adelante productos, tickets, etc.) con
la misma lógica de CRUD en memoria. Te piden construir esa lógica una sola
vez, de forma genérica, en vez de reescribirla para cada entidad. Además, el
frontend necesita una "vista pública" del perfil que nunca exponga el hash
de la contraseña, y un índice rápido por id para no recorrer arrays cada vez
que buscan un perfil puntual.

## Requisitos (criterios de aceptación)

- [ ] Modela `Perfil` con al menos: `id` (number), `nombre`, `email`,
      `passwordHash` y `createdAt` (Date).
- [ ] Construí un **repositorio genérico** `Repositorio<T>` (podés hacerlo
      como objeto de funciones, closures, o clase — vos elegís) que sirva
      para `T` de cualquier forma, siempre que tenga un `id: number`.
  - HINT: la restricción se escribe `<T extends { id: number }>`.
  - Debe soportar como mínimo:
    - `guardar(item: T): void`
    - `obtener(id: number): T | undefined`
    - `actualizar(id: number, cambios: Partial<T>): T | undefined` — aplica
      solo los campos presentes en `cambios`, sin pisar el resto, y sin
      mutar el objeto guardado (guarda un objeto nuevo).
      - HINT: `Partial<T>` da un tipo con todos los campos de `T` pero
        opcionales — así el llamador puede pasar "algunos, no todos".
    - `eliminar(id: number): boolean` — `true` si existía y se borró,
      `false` si no existía.
- [ ] Construí `PerfilPublico` **derivándolo de `Perfil`** con `Omit` (sin
      volver a tipear los campos a mano), que excluya `passwordHash`.
  - HINT: `Omit<T, 'campo'>` = todos los campos de `T` menos `'campo'`.
- [ ] Función `aVistaPublica(perfil: Perfil): PerfilPublico` que arme esa
      vista (sin exponer `passwordHash` en ningún punto intermedio).
- [ ] Función `indexarPorId(perfiles: Perfil[]): Record<number, Perfil>`
      que convierta un array en un objeto indexado por `id`.
  - HINT: `Record<K, V>` es un tipo objeto con claves `K` y valores `V`.
  - Decidí (y dejalo explícito en un comentario o en tus notas) qué pasa si
    el array tiene dos perfiles con el mismo `id`.
- [ ] Ninguna función debe mutar sus argumentos.
- [ ] No debe haber ningún `any` explícito ni implícito.
- [ ] Tests que cubran al menos: guardar y obtener (caso feliz), actualizar
      solo un subconjunto de campos (el resto no cambia), actualizar/eliminar
      un `id` que no existe (comportamiento explícito, no un choque
      silencioso), `aVistaPublica` no debe tener `passwordHash` en el objeto
      resultante (verificalo con `'passwordHash' in resultado`, no solo
      "compila"), e `indexarPorId` con ids duplicados (según la decisión que
      tomaste arriba).
- [ ] Manejo de errores explícito para `actualizar`/`eliminar` sobre un id
      inexistente — elegís el mecanismo, pero justificá la elección.

## Restricciones
- TypeScript puro, sin librerías externas.
- Debe compilar sin errores con `strict: true`.
- No hay firmas de función dadas más allá de las HINT de arriba — completá
  el resto vos.

## Stretch goals (opcional, para empujar a 🟨/🟩)
- Agregá `PerfilResumen` con `Pick<Perfil, 'id' | 'nombre'>` para una vista
  de listado, y una función que convierta un array de `Perfil` a
  `PerfilResumen[]`.
- ¿`Repositorio<T>` como objeto de closures o como clase? Documentá en 2-3
  líneas cuál elegiste y qué ibas a perder con la otra opción.
