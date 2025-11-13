export interface HorarioAtencion {
    id: number;
    dia: string;
    desde: string;
    hasta: string;
    duracionTurno: string;
    
    /** ID de la especialidad que se atiende en este horario (solo UNA por horario) */
    especialidadId?: number;
    
    /** Objeto especialidad completo (viene del backend con eager: true) */
    especialidad?: Especialidad;
}

export interface Direccion {
    id: number;
    calle: string;
    numero: string;
    localidad: string;
    codigoPostal: string;
    horariosAtencion: HorarioAtencion[];

    /** Indica si es una dirección de centro médico (copiada desde el centro) */
    esDireccionCentroMedico?: boolean;
    
    /** ID del centro médico que creó esta dirección */
    centroMedicoId?: number;

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

    /** 🆕 Lista de centros médicos donde trabaja este profesional (ManyToMany) */
    centrosMedicos?: Prestador[];

    /** 🆕 Lista de profesionales que trabajan en este centro (ManyToMany) */
    profesionales?: Prestador[];

    /** 🆕 Fecha de alta del prestador (puede ser futura) */
    fechaAlta?: string | null;

    /** 🆕 Fecha de baja del prestador (puede ser futura o inmediata) */
    fechaBaja?: string | null;

    /** Indica que el prestador aún no fue guardado en la base */
    esTemporal?: boolean;
}

export interface Especialidad {
    id: number;
    nombre: string;
}