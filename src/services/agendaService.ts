import { getApiUrl } from '../config/env';

// Servicio sencillo para la agenda: obtener prestadores con horarios y manejar turnos
class AgendaService {
  async getPrestadores() {
    const resp = await fetch(getApiUrl('/prestadores'));
    if (!resp.ok) throw new Error('Error al obtener prestadores');
    return resp.json();
  }

  // Obtener turnos existentes (stub - backend endpoint recomendable /turnos)
  async getTurnos() {
    const resp = await fetch(getApiUrl('/turnos'));
    if (!resp.ok) return [];
    return resp.json();
  }

  // Crear un turno (validar horario contra prestador.horarioAtencion antes de crear)
  async createTurno(turno: any) {
    const resp = await fetch(getApiUrl('/turnos'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turno)
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || 'Error al crear turno');
    }
    return resp.json();
  }
}

export const agendaService = new AgendaService();
