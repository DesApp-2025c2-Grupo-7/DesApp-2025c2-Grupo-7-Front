interface Direccion {
  calle: string;
  numero: string;
  localidad: string;
  codigoPostal: string | null;
  horariosAtencion: HorarioAtencion[];
}

interface HorarioAtencion {
  dia: string;
  desde: string;
  hasta: string;
  duracionTurno: string;
}
interface Prestador {
  id: number;
  numeroCUIL: string;export interface HorarioAtencion {
    dia: string;
    desde: string;
    hasta: string;
    duracionTurno: string;
}

export interface Direccion {
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

  nombreCompleto: string;
  especialidades: string[];export interface HorarioAtencion {
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

  tipoPrestacion: string;
  telefono: string[];
  email: string[];
  direccion: Direccion[]
}

interface ListaPrestadoresProps {
    prestadores: Prestador[];
}

export { Direccion, HorarioAtencion, Prestador, ListaPrestadoresProps };