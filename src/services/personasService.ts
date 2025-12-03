// Servicio para manejar todas las llamadas a la API de personas
import { getApiUrl } from '../config/env';
import type { Persona as Afiliado } from '../types/afiliados';

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
    depto?: string | null;
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
      // Try to extract server error message
      let details = '';
      try {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const body = await response.json();
          details = JSON.stringify(body);
        } else {
          details = await response.text();
        }
      } catch (e) {
        details = `Could not parse error body: ${(e as Error).message}`;
      }
      throw new Error(`HTTP error ${response.status}: ${details}`);
    }

    return response.json();
  }

  // Crear un nuevo integrante en el grupo familiar
  async createIntegrante(titularCredencial: string, integranteData: IntegranteData) {
    try {
      
      // Primero necesitamos obtener el ID del titular usando su credencial
      const titular = await this.getGrupoFamiliar(titularCredencial);
      
      
      if (!titular || !titular.id) {
        throw new Error(`No se pudo encontrar el titular con credencial ${titularCredencial}`);
      }

      // Preparar el payload limpio para el endpoint específico
      const payload = {
        nombre: integranteData.nombre,
        apellido: integranteData.apellido,
        tipoDocumento: integranteData.tipoDocumento,
        numeroDocumento: integranteData.numeroDocumento,
        fechaNacimiento: integranteData.fechaNacimiento,
        telefono: integranteData.telefono,
        email: integranteData.email,
        parentesco: integranteData.parentesco,
        fechaAlta: integranteData.fechaAlta,
        fechaBaja: integranteData.fechaBaja,
        direccion: integranteData.direccion,
        situacionesTerapeuticas: integranteData.situacionesTerapeuticas,
      };


      // Usar el endpoint específico para agregar integrantes
      const response = await fetch(getApiUrl(`/personas/${titular.id}/integrantes`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let details = '';
        try {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const body = await response.json();
            details = typeof body === 'object' ? JSON.stringify(body, null, 2) : String(body);
          } else {
            details = await response.text();
          }
        } catch (e) {
          details = `Could not parse error body: ${(e as Error).message}`;
        }
        throw new Error(`Error ${response.status} al crear integrante: ${details}`);
      }

      const nuevoIntegrante = await response.json();

      
      return nuevoIntegrante;
      
    } catch (error) {
      console.error('Error en createIntegrante:', error);
      throw error;
    }
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