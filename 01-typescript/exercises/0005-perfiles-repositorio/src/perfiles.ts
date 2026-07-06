// =============================================================
// Perfiles de usuario: repositorio genérico y utility types
// =============================================================

// ------------------------------
// 1. Modelo base
// ------------------------------
export interface Perfil {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

// ------------------------------
// 2. Repositorio genérico
// ------------------------------
// Elegí un objeto de closures (factory function) en vez de una clase.
// El Map interno queda 100% encapsulado: nadie puede tocarlo desde afuera,
// ni siquiera con un cast. Con una clase habría ganado `extends` /
// jerarquías y un `instanceof` útil, pero para un CRUD plano no los
// necesito. (Ver stretch goal al final para más detalle.)

export interface Repositorio<T extends { id: number }> {
  guardar(item: T): void;
  obtener(id: number): T | undefined;
  actualizar(id: number, cambios: Partial<T>): T | undefined;
  eliminar(id: number): boolean;
}

export function crearRepositorio<T extends { id: number }>(): Repositorio<T> {
  // Map en vez de objeto plano: claves numéricas nativas y .has/.delete
  // gratis. Es estado privado de la closure.
  const datos = new Map<number, T>();

  return {
    guardar(item: T): void {
      // Copia defensiva PROFUNDA. Un spread ({ ...item }) copiaría solo el
      // primer nivel: campos mutables anidados como Date compartirían
      // referencia, y `repo.obtener(id)!.createdAt.setFullYear(1999)`
      // corrompería el estado interno. structuredClone clona Date, arrays
      // y objetos anidados. (Limitación asumida: el repo es para entidades
      // de datos planos serializables — structuredClone lanza si T trae
      // funciones o instancias de clase con métodos.)
      datos.set(item.id, structuredClone(item));
    },

    obtener(id: number): T | undefined {
      const item = datos.get(id);
      // Clon profundo también a la salida: devolver el interno (o una
      // copia superficial de él) permitiría mutarlo desde afuera.
      return item === undefined ? undefined : structuredClone(item);
    },

    // MANEJO DE ERRORES — decisión y justificación:
    // Para "id inexistente" devuelvo `undefined` (actualizar) y `false`
    // (eliminar) en vez de lanzar una excepción. Razón: que un id no esté
    // es un resultado *esperable* del dominio (carreras, borrados previos),
    // no un bug del programa. Codificarlo en el tipo de retorno obliga al
    // llamador a manejarlo (strict + strictNullChecks no lo dejan ignorar
    // el `undefined`), mientras que una excepción es invisible en la firma
    // y fácil de olvidar. Reservaría `throw` para invariantes rotas.
    actualizar(id: number, cambios: Partial<T>): T | undefined {
      const actual = datos.get(id);
      if (actual === undefined) {
        return undefined;
      }
      // Objeto NUEVO: no mutamos ni el guardado ni `cambios`.
      // Spread de `cambios` al final: solo pisa los campos presentes.
      const actualizado: T = { ...actual, ...cambios, id: actual.id };
      // ^ fijamos `id` explícitamente para que un `cambios` malicioso o
      //   descuidado no pueda "mover" el item a otra clave del índice.
      //
      // Clon profundo al guardar: `cambios` viene del llamador y puede
      // traer referencias mutables (p. ej. un Date) que el llamador
      // conserva. Y clon profundo aparte al devolver, para que el objeto
      // retornado tampoco comparta nada con el almacenado.
      datos.set(id, structuredClone(actualizado));
      return structuredClone(actualizado);
    },

    eliminar(id: number): boolean {
      // Map.delete ya devuelve true/false según existiera — exactamente
      // el contrato pedido.
      return datos.delete(id);
    },
  };
}

// ------------------------------
// 3. Vista pública con Omit
// ------------------------------
// Derivado, no re-tipeado: si mañana Perfil gana un campo, PerfilPublico
// lo gana automáticamente (y aVistaPublica deja de compilar hasta que lo
// agregues — eso es una feature, no un bug).
export type PerfilPublico = Omit<Perfil, 'passwordHash'>;

export function aVistaPublica(perfil: Perfil): PerfilPublico {
  // Construcción explícita campo por campo, en vez de
  //   const { passwordHash, ...resto } = perfil;
  // porque el destructuring con rest *sí* copia el hash a una variable
  // local intermedia — justo lo que el enunciado pide evitar. Acá el hash
  // nunca se lee. Bonus: si Perfil crece, esto no compila hasta que
  // decidas conscientemente si el campo nuevo es público o no.
  return {
    id: perfil.id,
    nombre: perfil.nombre,
    email: perfil.email,
    // Date es mutable: sin este clon, la vista pública compartiría la
    // MISMA instancia que el Perfil fuente, y mutar una mutaría la otra.
    createdAt: new Date(perfil.createdAt),
  };
}

// ------------------------------
// 4. Índice por id con Record
// ------------------------------
// DECISIÓN sobre ids duplicados: "el último gana". Es la semántica natural
// de asignar sobre la misma clave, es determinista, y coincide con lo que
// haría Object.fromEntries o un upsert. La alternativa (lanzar error) sería
// razonable si un duplicado indicara datos corruptos; acá preferí que la
// función sea total y dejar la validación a otra capa.
export function indexarPorId(perfiles: Perfil[]): Record<number, Perfil> {
  const indice: Record<number, Perfil> = {};
  for (const perfil of perfiles) {
    indice[perfil.id] = perfil; // último gana
  }
  return indice; // `perfiles` nunca se muta; el índice es un objeto nuevo
}

// ------------------------------
// 5. Stretch goal: PerfilResumen con Pick
// ------------------------------
export type PerfilResumen = Pick<Perfil, 'id' | 'nombre'>;

export function aResumenes(perfiles: Perfil[]): PerfilResumen[] {
  // .map devuelve un array nuevo y cada resumen es un objeto nuevo:
  // cero mutación de los argumentos.
  return perfiles.map((p) => ({ id: p.id, nombre: p.nombre }));
}