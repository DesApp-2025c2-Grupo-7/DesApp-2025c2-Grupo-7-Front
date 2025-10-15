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
}

export interface Persona {
    id: number;
    credencial: string;
    tipoDocumento: string;
    numeroDocumento: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    telefono: string[];
    direccion: Direccion[];
    email: string[];
    fechaAlta: string;
    fechaBaja: string | null;
    situacionesTerapeuticas?: SituacionTerapeutica[];
    planMedico: string;
}
export interface Afiliado extends Persona {
    sufijo: string;
    parentesco: string;
    grupoFamiliar: Integrante[];    
    
}export interface Integrante extends Persona {
    sufijo: string;
    parentesco: string;
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

export interface GrupoFamiliar {
    id: number;
    credencial: string;
    planMedico: string;
    estado: string;
    fechaAlta: string;
    fechaBaja: string | null;
    personas: Integrante[];
}

export interface ListaAfiliadosProps {
    afiliados: AfiliadoListItem[];
}

