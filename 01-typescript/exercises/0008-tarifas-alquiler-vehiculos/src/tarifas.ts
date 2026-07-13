// Imterfaces
export interface Vehiculo {
    id: string,
    tipo: 'bicicleta' | 'scooter' | 'patineta',
    bateriaPct?: number
}

export interface Usuario {
    id: string,
    nombre: string,
    membresia: 'basica' | 'preium'
}

export interface Reserva {
    id: string,
    vehiculoId: string,
    usuarioId: string,
    minutos: number,
    codigoPromo: unknown
}

export interface TarifaBase {
    precioPorMinuto: number
}

export type TarifaConSurge = TarifaBase & {
    multiplicadorSurge: number
}

// Funciones

export function  calcularCostoFinal(
    reserva: Reserva,
    vehiculo: Vehiculo,
    usuario: Usuario,
    tarifa: TarifaBase | TarifaConSurge
): number {
    if(reserva.vehiculoId === vehiculo.id && reserva.usuarioId === usuario.id){
        throw new Error('Los valores de vehiculo y/o usuario no coinciden, revisar Id.') 
    }

    let costoBase: number;
    costoBase = tarifa.precioPorMinuto * reserva.minutos;

    if( ){

    }


    return 2
}