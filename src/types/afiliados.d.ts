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

interface GrupoFamiliar {
  id: string;
  planMedico: string;
  fechaAltaPlan: string;
  fechaBajaPlan: string | null;
  titularId: number;
}
interface Afiliado {
  id: number;
  credencial: string;
  grupoFamiliar: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;  
  telefono: string[];
  direccion: Direccion[];
  email: string[];
  parentesco: string;
  titularId?: number;
  fechaAlta: string;
  fechaBaja: string | null;
  situacionesTerapeuticas?: SituacionTerapeutica[];
}

interface ListaAfiliadosProps {
    afiliados: Afiliado[];
}

export { Direccion, SituacionTerapeutica, GrupoFamiliar, Afiliado, ListaAfiliadosProps};