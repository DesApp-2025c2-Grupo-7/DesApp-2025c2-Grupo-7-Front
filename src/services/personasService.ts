// Servicio para manejar todas las llamadas a la API de personas
import { getApiUrl } from '../config/env';
import type { Afiliado } from '../types/afiliados';

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
  // Crear un nuevo afiliado (titular)
  async createAfiliado(afiliadoData: Partial<Afiliado> | any) {
    const response = await fetch(getApiUrl('/personas'), {
      method: 'POST',
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

  // === MÉTODOS PARA DIRECCIONES ===
  
  // Crear una nueva dirección para una persona
  async createDireccion(personaId: number, direccionData: Omit<import('../types/afiliados').Direccion, 'id'>) {
    const response = await fetch(getApiUrl(`/personas/${personaId}/direcciones`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(direccionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Actualizar una dirección existente
  async updateDireccion(personaId: number, direccionId: number, direccionData: Partial<import('../types/afiliados').Direccion>) {
    const response = await fetch(getApiUrl(`/personas/${personaId}/direcciones/${direccionId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(direccionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Eliminar una dirección
  async deleteDireccion(personaId: number, direccionId: number) {
    const response = await fetch(getApiUrl(`/personas/${personaId}/direcciones/${direccionId}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // === MÉTODOS PARA SITUACIONES TERAPÉUTICAS ===
  
  // Crear una nueva situación terapéutica para una persona
  async createSituacionTerapeutica(personaId: number, situacionData: Omit<import('../types/afiliados').SituacionTerapeutica, 'id'>) {
    const response = await fetch(getApiUrl(`/personas/${personaId}/situaciones-terapeuticas`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(situacionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Actualizar una situación terapéutica existente
  async updateSituacionTerapeutica(personaId: number, situacionId: number, situacionData: Partial<import('../types/afiliados').SituacionTerapeutica>) {
    const response = await fetch(getApiUrl(`/personas/${personaId}/situaciones-terapeuticas/${situacionId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(situacionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Eliminar una situación terapéutica
  async deleteSituacionTerapeutica(personaId: number, situacionId: number) {
    const response = await fetch(getApiUrl(`/personas/${personaId}/situaciones-terapeuticas/${situacionId}`), {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const personasService = new PersonasService();
export default personasService;