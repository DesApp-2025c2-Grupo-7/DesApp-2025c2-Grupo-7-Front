export interface HorarioAtencion {
    id: number;
    dia: string;
    desde: string;
    hasta: string;
    duracionTurno: string;
}

export interface Direccion {
    id: number;
    calle: string;
    numero: string;
    localidad: string;
    codigoPostal: string;
    horariosAtencion: HorarioAtencion[];
}

export interface Prestador {
    id: number;
    numeroCUIL: string;
    nombreCompleto: string;
    especialidades: Especialidad[];
    esProfesionalIndependiente: boolean;
    telefono: string[];
    email: string[];
    direccion: Direccion[];
}

export interface Especialidad {
    id: number;
    nombre: string;
}
