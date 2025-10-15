// Servicio para manejar todas las llamadas a la API de personas
import { getApiUrl } from '../config/env';
import type { Afiliado, Persona } from '../types/afiliados';

export interface IntegranteData {
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  telefono: string[];
  email: string[];
  parentesco: string;
  fechaAlta: string;
  fechaBaja: string | null;
  direccion: Array<{
    calle: string;
    numero: string;
    localidad: string;
    codigoPostal: string;
    depto: string | null;
  }>;
  situacionesTerapeuticas: Array<{
    diagnostico: string;
    fechaInicio: string;
    fechaFin: string | null;
  }>;
}

// Interface que representa la respuesta del backend para una persona con su grupo
export interface PersonaConGrupo {
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
  direccion: Array<{
    calle: string;
    numero: string;
    localidad: string;
    codigoPostal: string;
    depto: string | null;
  }>;
  situacionesTerapeuticas?: Array<{
    diagnostico: string;
    fechaInicio: string;
    fechaFin: string | null;
  }>;
  planMedico: string;
  fechaAlta: string;
  fechaBaja: string | null;
  grupoFamiliar: Array<PersonaConGrupo>; // Integrantes del grupo
}

class PersonasService {
  // Crear un nuevo integrante en el grupo familiar
  async createIntegrante(afiliadoId: number, integranteData: IntegranteData) {
    const response = await fetch(getApiUrl(`/personas/${afiliadoId}/integrantes`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(integranteData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Obtener un afiliado por ID
  async getAfiliado(id: number) {
    const response = await fetch(getApiUrl(`/personas/${id}`));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Obtener todos los afiliados
  async getAllAfiliados() {
    const response = await fetch(getApiUrl('/personas'));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Actualizar un afiliado
  async updateAfiliado(id: number, afiliadoData: Partial<Afiliado>) {
    const response = await fetch(getApiUrl(`/personas/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(afiliadoData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Dar de baja un afiliado
  async bajaAfiliado(id: number) {
    const response = await fetch(getApiUrl(`/personas/${id}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Obtener grupo familiar por credencial
  async getGrupoFamiliar(credencial: string) {
    const response = await fetch(getApiUrl(`/personas/grupo/${credencial}`));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Buscar afiliados (acepta query opcional)
  async searchAfiliados(query?: string) {
    const url = query ? getApiUrl(`/personas?q=${encodeURIComponent(query)}`) : getApiUrl('/personas');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const personasService = new PersonasService();
export default personasService;