interface Direccion {
  calle: string;
  numero: string;
  depto?: string | null;
  localidad: string;
  codigoPostal: string | null;
}

interface SituacionTerapeutica {
  diagnostico: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
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

interface Afiliado {
  id: number;
  credencial: string;
  sufijo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;  
  telefono: string[];
  direccion: Direccion[];
  email: string[];
  parentesco: string;
  situacionesTerapeuticas: SituacionTerapeutica[];
  planMedico: string;
  fechaAlta: string;
  fechaBaja: string | null;
  grupoFamiliar: Integrante[];
}

// Tipo unificado para mostrar en listas (puede ser Afiliado titular o Integrante)
interface AfiliadoListItem {
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
  id: number;
  plan: string;
  planMedico: string;
  fechaCreacion: string;
  fechaAltaPlan: string;
  activo: boolean;
}

interface ListaAfiliadosProps {
    afiliados: AfiliadoListItem[];
}

export { Direccion, SituacionTerapeutica, Integrante, Afiliado, AfiliadoListItem, ListaAfiliadosProps, GrupoFamiliar};