import { getApiUrl } from '../config/env';

// Servicio sencillo para la agenda: obtener prestadores con horarios y manejar turnos
class AgendaService {
  async getPrestadores() {
    const resp = await fetch(getApiUrl('/prestadores'));
    if (!resp.ok) throw new Error('Error al obtener prestadores');
    return resp.json();
  }
}

export const agendaService = new AgendaService();
