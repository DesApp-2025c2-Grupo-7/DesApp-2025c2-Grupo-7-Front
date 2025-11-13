/**
 * Utilidades para determinar el estado activo/inactivo de afiliados e integrantes
 */

export interface PersonaEstado {
  fechaAlta?: string;
  fechaBaja?: string | null;
}

/**
 * Determina si una persona (afiliado o integrante) está activa
 * @param persona - Objeto con fechaAlta y fechaBaja
 * @returns true si está activa, false si está inactiva
 */
export const esPersonaActiva = (persona: PersonaEstado): boolean => {
  if (!persona) return false;
  
  const today = new Date().toISOString().split('T')[0];
  
  // Si la fecha de alta está en el futuro, aún no está activo
  if (persona.fechaAlta && persona.fechaAlta > today) return false;
  
  // Si no tiene fecha de baja, está activo
  if (!persona.fechaBaja) return true;
  
  // Si tiene fecha de baja, verificar si es futura
  return persona.fechaBaja > today;
};

/**
 * Obtiene el texto descriptivo del estado de una persona
 * @param persona - Objeto con fechaAlta y fechaBaja
 * @returns Texto descriptivo del estado
 */
export const getTextoEstadoPersona = (persona: PersonaEstado): string => {
  if (!persona) return 'Estado desconocido';
  
  const today = new Date().toISOString().split('T')[0];
  
  // Si la fecha de alta está en el futuro
  if (persona.fechaAlta && persona.fechaAlta > today) {
    return `Activo a partir de ${persona.fechaAlta}`;
  }
  
  // Si no tiene fecha de baja, está activo
  if (!persona.fechaBaja) return 'Activo';
  
  // Si tiene fecha de baja futura
  if (persona.fechaBaja > today) {
    return `Activo hasta ${persona.fechaBaja}`;
  }
  
  // Si la fecha de baja ya pasó
  return 'Inactivo';
};

/**
 * Obtiene el label de estado para el header (en mayúsculas)
 * @param persona - Objeto con fechaAlta y fechaBaja
 * @returns Label de estado en mayúsculas
 */
export const getLabelEstadoPersona = (persona: PersonaEstado): string => {
  if (!persona) return 'ESTADO DESCONOCIDO';
  
  const today = new Date().toISOString().split('T')[0];
  
  // Si la fecha de alta está en el futuro
  if (persona.fechaAlta && persona.fechaAlta > today) {
    return `ACTIVO A PARTIR DE ${persona.fechaAlta}`;
  }
  
  // Si no tiene fecha de baja, está activo
  if (!persona.fechaBaja) return 'ACTIVO';
  
  // Si tiene fecha de baja, verificar si es futura o pasada
  return persona.fechaBaja > today ? 'ACTIVO' : 'INACTIVO';
};