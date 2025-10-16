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

    /** Campo opcional para manejar datos locales antes de persistir en el backend */
    esTemporal?: boolean; // 👈 agregado
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

    /** Indica que el prestador aún no fue guardado en la base */
    esTemporal?: boolean; // 👈 agregado
}

export interface Especialidad {
    id: number;
    nombre: string;
}
