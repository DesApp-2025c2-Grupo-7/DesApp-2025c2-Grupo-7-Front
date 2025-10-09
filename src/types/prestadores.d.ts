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
  numeroCUIL: string;
  nombreCompleto: string;
  especialidades: string[];
  tipoPrestacion: string;
  telefono: string[];
  email: string[];
  direccion: Direccion[]
}

interface ListaPrestadoresProps {
    prestadores: Prestador[];
}

export { Direccion, HorarioAtencion, Prestador, ListaPrestadoresProps };