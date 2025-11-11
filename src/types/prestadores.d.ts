export interface HorarioAtencion {
    id: number;
    dia: string;
    desde: string;
    hasta: string;
    duracionTurno: string;
    
    /** 🆕 ID de la especialidad que se atiende en este horario (solo UNA por horario) */
    especialidadId?: number;
    
    /** 🆕 Objeto especialidad completo (viene del backend con eager: true) */
    especialidad?: Especialidad;
}

export interface Direccion {
    id: number;
    calle: string;
    numero: string;
    localidad: string;
    codigoPostal: string;
    horariosAtencion: HorarioAtencion[];

    /** Campo opcional para manejar datos locales antes de persistir en el backend */
    esTemporal?: boolean;
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

    /** 🆕 ID del centro médico al que está asignado (solo para profesionales independientes) */
    centroAsignadoId?: number | null;

    /** 🆕 Fecha de baja del prestador */
    fechaBaja?: string | null;

    /** Indica que el prestador aún no fue guardado en la base */
    esTemporal?: boolean;
}

export interface Especialidad {
    id: number;
    nombre: string;
}