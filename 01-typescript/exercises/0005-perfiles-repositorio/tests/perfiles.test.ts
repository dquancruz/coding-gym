import {
    Perfil,
    PerfilPublico,
    crearRepositorio,
    aVistaPublica,
    indexarPorId,
    aResumenes,
} from '../src/perfiles';

function crearPerfil(overrides: Partial<Perfil> = {}): Perfil {
    return {
        id: 1,
        nombre: 'Ada Lovelace',
        email: 'ada@example.com',
        passwordHash: 'hash-secreto-123',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        ...overrides,
    };
}

console.log("Iniciando pruebas del repositorio genérico y las vistas de perfil...");

// Caso de prueba 1: caso feliz -> guardar y obtener un perfil
try {
    const repo = crearRepositorio<Perfil>();
    const ada = crearPerfil();
    repo.guardar(ada);

    const obtenido = repo.obtener(1);
    console.assert(obtenido !== undefined, "Error: obtener un id guardado no debería dar undefined");
    if (obtenido !== undefined) {
        console.assert(obtenido.nombre === 'Ada Lovelace', "Error: el nombre no coincide con lo guardado");
        console.assert(obtenido.email === 'ada@example.com', "Error: el email no coincide con lo guardado");
        console.assert(
            obtenido.createdAt.getTime() === ada.createdAt.getTime(),
            "Error: la fecha no coincide con lo guardado"
        );
    }

    console.log("Prueba de caso feliz (guardar y obtener) aprobada.");
} catch (error) {
    console.error("La prueba de caso feliz falló inesperadamente:", error);
}

// Caso de prueba 2: obtener, actualizar y eliminar un id inexistente
// (comportamiento explícito, no un choque silencioso)
try {
    const repo = crearRepositorio<Perfil>();

    console.assert(
        repo.obtener(999) === undefined,
        "Error: obtener un id inexistente debería devolver undefined"
    );
    console.assert(
        repo.actualizar(999, { nombre: 'Nadie' }) === undefined,
        "Error: actualizar un id inexistente debería devolver undefined, sin lanzar"
    );
    console.assert(
        repo.eliminar(999) === false,
        "Error: eliminar un id inexistente debería devolver false"
    );

    console.log("Prueba de operaciones sobre id inexistente aprobada.");
} catch (error) {
    console.error("La prueba de id inexistente falló inesperadamente:", error);
}

// Caso de prueba 3: actualizar solo un subconjunto de campos preserva el resto
try {
    const repo = crearRepositorio<Perfil>();
    repo.guardar(crearPerfil());

    const resultado = repo.actualizar(1, { nombre: 'Ada L.' });
    console.assert(resultado !== undefined, "Error: actualizar un id existente no debería dar undefined");
    if (resultado !== undefined) {
        console.assert(resultado.nombre === 'Ada L.', "Error: el campo enviado no se aplicó");
        console.assert(resultado.email === 'ada@example.com', "Error: el email no debería cambiar");
        console.assert(resultado.passwordHash === 'hash-secreto-123', "Error: el hash no debería cambiar");
        console.assert(resultado.id === 1, "Error: el id no debería cambiar al actualizar");
    }
    console.assert(
        repo.obtener(1)?.nombre === 'Ada L.',
        "Error: el cambio debería quedar persistido en el repositorio"
    );

    console.log("Prueba de actualización parcial aprobada.");
} catch (error) {
    console.error("La prueba de actualización parcial falló inesperadamente:", error);
}

// Caso de prueba 4: actualizar no muta ni el objeto guardado ni los cambios
try {
    const repo = crearRepositorio<Perfil>();
    const original = crearPerfil();
    repo.guardar(original);

    const snapshotPrevio = repo.obtener(1);
    const cambios = { nombre: 'Ada L.' };
    repo.actualizar(1, cambios);

    console.assert(
        snapshotPrevio?.nombre === 'Ada Lovelace',
        "Error: el snapshot obtenido antes de actualizar no debería cambiar"
    );
    console.assert(
        original.nombre === 'Ada Lovelace',
        "Error: actualizar no debe mutar el objeto original del llamador"
    );
    console.assert(
        Object.keys(cambios).length === 1 && cambios.nombre === 'Ada L.',
        "Error: actualizar no debe mutar el objeto de cambios"
    );

    console.log("Prueba de no mutación en actualizar aprobada.");
} catch (error) {
    console.error("La prueba de no mutación falló inesperadamente:", error);
}

// Caso de prueba 5: eliminar devuelve true si existía y false si no
try {
    const repo = crearRepositorio<Perfil>();
    repo.guardar(crearPerfil());

    console.assert(repo.eliminar(1) === true, "Error: eliminar un id existente debería devolver true");
    console.assert(repo.eliminar(1) === false, "Error: eliminar dos veces debería devolver false la segunda");
    console.assert(repo.obtener(1) === undefined, "Error: el perfil eliminado no debería poder obtenerse");

    console.log("Prueba de eliminar aprobada.");
} catch (error) {
    console.error("La prueba de eliminar falló inesperadamente:", error);
}

// Caso de prueba 6: la vista pública no expone passwordHash (en runtime, no solo en tipos)
try {
    const perfil = crearPerfil();
    const publico: PerfilPublico = aVistaPublica(perfil);

    console.assert(
        ('passwordHash' in publico) === false,
        "Error: la vista pública no debe contener passwordHash como propiedad"
    );
    console.assert(publico.id === 1, "Error: la vista pública debería conservar el id");
    console.assert(publico.nombre === 'Ada Lovelace', "Error: la vista pública debería conservar el nombre");
    console.assert(publico.email === 'ada@example.com', "Error: la vista pública debería conservar el email");
    console.assert(
        perfil.passwordHash === 'hash-secreto-123',
        "Error: aVistaPublica no debe mutar el perfil de entrada"
    );

    console.log("Prueba de vista pública sin passwordHash aprobada.");
} catch (error) {
    console.error("La prueba de vista pública falló inesperadamente:", error);
}

// Caso de prueba 7: indexarPorId indexa por id y no muta el array de entrada
try {
    const perfiles = [crearPerfil({ id: 1 }), crearPerfil({ id: 2, nombre: 'Grace Hopper' })];

    const indice = indexarPorId(perfiles);

    console.assert(indice[1]?.nombre === 'Ada Lovelace', "Error: el perfil 1 no quedó indexado por su id");
    console.assert(indice[2]?.nombre === 'Grace Hopper', "Error: el perfil 2 no quedó indexado por su id");
    console.assert(perfiles.length === 2, "Error: indexarPorId no debe mutar el array de entrada");
    console.assert(
        perfiles[0].id === 1 && perfiles[1].id === 2,
        "Error: indexarPorId no debe reordenar ni alterar los elementos"
    );

    console.log("Prueba de indexarPorId aprobada.");
} catch (error) {
    console.error("La prueba de indexarPorId falló inesperadamente:", error);
}

// Caso de prueba 8: indexarPorId con ids duplicados -> el último gana
// (decisión documentada en src/perfiles.ts)
try {
    const primero = crearPerfil({ id: 7, nombre: 'Primero' });
    const segundo = crearPerfil({ id: 7, nombre: 'Segundo' });

    const indice = indexarPorId([primero, segundo]);

    console.assert(
        indice[7]?.nombre === 'Segundo',
        "Error: con ids duplicados debería quedar el último del array"
    );

    console.log("Prueba de ids duplicados aprobada.");
} catch (error) {
    console.error("La prueba de ids duplicados falló inesperadamente:", error);
}

// Caso de prueba 9 (regresión): las copias defensivas deben ser profundas.
// Un spread superficial compartía la instancia de Date, y mutar el Date
// devuelto corrompía en silencio el estado interno del repositorio.
try {
    const repo = crearRepositorio<Perfil>();
    repo.guardar(crearPerfil({ id: 3 }));

    // Repro exacto del bug encontrado:
    repo.obtener(3)?.createdAt.setFullYear(1999);
    console.assert(
        repo.obtener(3)?.createdAt.getFullYear() === 2024,
        "Error: mutar el Date devuelto por obtener no debe corromper el repositorio"
    );

    // Mismo leak por la puerta de entrada: el llamador conserva su referencia
    const ada = crearPerfil({ id: 4 });
    repo.guardar(ada);
    ada.createdAt.setFullYear(1999);
    console.assert(
        repo.obtener(4)?.createdAt.getFullYear() === 2024,
        "Error: mutar el objeto original después de guardar no debe afectar al repositorio"
    );

    // Y por actualizar: tanto lo devuelto como un Date dentro de cambios
    const devuelto = repo.actualizar(3, { nombre: 'Ada L.' });
    devuelto?.createdAt.setFullYear(1999);
    console.assert(
        repo.obtener(3)?.createdAt.getFullYear() === 2024,
        "Error: mutar el Date devuelto por actualizar no debe corromper el repositorio"
    );

    const nuevaFecha = new Date('2025-06-01T00:00:00Z');
    repo.actualizar(3, { createdAt: nuevaFecha });
    nuevaFecha.setFullYear(1999);
    console.assert(
        repo.obtener(3)?.createdAt.getFullYear() === 2025,
        "Error: un Date pasado en cambios debe quedar desacoplado del llamador"
    );

    console.log("Prueba de regresión de copias profundas aprobada.");
} catch (error) {
    console.error("La prueba de copias profundas falló inesperadamente:", error);
}

// Caso de prueba 10 (regresión): la vista pública no comparte el Date fuente
try {
    const perfil = crearPerfil();
    const publico = aVistaPublica(perfil);

    console.assert(
        publico.createdAt !== perfil.createdAt,
        "Error: la vista pública debe tener su propia instancia de Date"
    );
    console.assert(
        publico.createdAt.getTime() === perfil.createdAt.getTime(),
        "Error: la fecha de la vista pública debe representar el mismo instante"
    );

    publico.createdAt.setFullYear(1999);
    console.assert(
        perfil.createdAt.getFullYear() === 2024,
        "Error: mutar el Date de la vista pública no debe afectar al perfil fuente"
    );

    console.log("Prueba de Date desacoplado en la vista pública aprobada.");
} catch (error) {
    console.error("La prueba de Date en vista pública falló inesperadamente:", error);
}

// Caso de prueba 11: el repositorio es genérico de verdad
// (funciona con cualquier T que tenga id: number)
try {
    interface Producto {
        id: number;
        titulo: string;
        precio: number;
    }

    const repo = crearRepositorio<Producto>();
    repo.guardar({ id: 10, titulo: 'Teclado', precio: 50 });

    const actualizado = repo.actualizar(10, { precio: 45 });
    console.assert(actualizado?.precio === 45, "Error: el precio no se actualizó");
    console.assert(actualizado?.titulo === 'Teclado', "Error: el título no debería cambiar");
    console.assert(repo.eliminar(10) === true, "Error: eliminar el producto debería devolver true");

    console.log("Prueba de repositorio con otra entidad aprobada.");
} catch (error) {
    console.error("La prueba de repositorio genérico falló inesperadamente:", error);
}

// Caso de prueba 12 (stretch): PerfilResumen con Pick expone solo id y nombre
try {
    const resumenes = aResumenes([crearPerfil({ id: 3, nombre: 'Katherine' })]);

    console.assert(resumenes.length === 1, "Error: debería haber exactamente un resumen");
    console.assert(resumenes[0].id === 3, "Error: el resumen debería conservar el id");
    console.assert(resumenes[0].nombre === 'Katherine', "Error: el resumen debería conservar el nombre");
    console.assert(
        ('email' in resumenes[0]) === false,
        "Error: el resumen no debe contener email"
    );
    console.assert(
        ('passwordHash' in resumenes[0]) === false,
        "Error: el resumen no debe contener passwordHash"
    );

    console.log("Prueba de PerfilResumen aprobada.");
} catch (error) {
    console.error("La prueba de PerfilResumen falló inesperadamente:", error);
}

console.log("Pruebas completadas.");