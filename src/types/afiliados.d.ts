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
interface Afiliado {
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
  parentesco: string;
  fechaAlta: string;
  fechaBaja: string | null;
  situacionesTerapeuticas?: SituacionTerapeutica[];
  planMedico: string;
}

interface ListaAfiliadosProps {
    afiliados: Afiliado[];
}

export { Direccion, SituacionTerapeutica, Afiliado, ListaAfiliadosProps};