export interface Direccion {
    id: number;
    calle: string;
    numero: string;
    depto?: string | null;
    localidad: string;
    codigoPostal: string | null;
}

export interface SituacionTerapeutica {
    id: number;
    diagnostico: string | null;
    fechaInicio: string | null;
    fechaFin: string | null;
    personaId?: number;
}

interface Persona {
  id: number;
  credencial: string;
  sufijo: string;
  tipoPersona: 'AFILIADO' | 'INTEGRANTE';
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string[];
  email: string[];
  parentesco?: string;
  direccion: Direccion[];
  situacionesTerapeuticas?: SituacionTerapeutica[];
  grupoFamiliar: GrupoFamiliar;
  grupoFamiliarId: string;
  planMedico: string;
  fechaAlta: string;
  fechaBaja: string | null;
}

interface Integrante {
  id: number;
  credencial: string;
  sufijo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string[];
  email: string[];
  direccion: Direccion[];
  parentesco: string;
  situacionesTerapeuticas: SituacionTerapeutica[];
  planMedico: string;
  fechaAlta: string;
  fechaBaja: string | null;
  afiliadoId: number;
}



// Tipo unificado para mostrar en listas (puede ser Afiliado titular o Integrante)
export interface AfiliadoListItem {
  id: number;
  credencial: string;
  sufijo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string[];
  email: string[];
  direccion: Direccion[];
  parentesco: string;
  situacionesTerapeuticas: SituacionTerapeutica[];
  planMedico: string;
  fechaAlta: string;
  fechaBaja: string | null;
  esTitular: boolean;
  titularId?: number; // Solo para integrantes
}

interface GrupoFamiliar {
  id?: number;
  credencial?: string;
  plan?: string;
  planMedico: string;
  estado?: string;
  fechaCreacion?: string;
  fechaAlta?: string;
  fechaAltaPlan?: string;
  fechaBaja?: string | null;
  activo?: boolean;
  personas?: Persona[];
}

export interface ListaAfiliadosProps {
    afiliados: AfiliadoListItem[];
    totalAfiliados?: number; // Total de afiliados filtrados (independiente de la paginación)
}

export interface ReporteSituacionFamiliar {
  titular: Persona;
  integrantes: Persona[];
  situacionesPorIntegrante: {
    integrante: Persona;
    situaciones: SituacionTerapeutica[];
  }[];
  totalSituaciones: number;
  situacionesActivas: number;
}

export { Direccion, SituacionTerapeutica, Persona, Integrante, Afiliado, AfiliadoListItem, ListaAfiliadosProps, GrupoFamiliar};
