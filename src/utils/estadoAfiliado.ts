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
  
  // Regla para "activo HOY":
  // - fechaAlta en el futuro (>) => aún no está activo
  // - fechaAlta igual a hoy => ya está activo
  // - fechaBaja igual a hoy o anterior => ya está inactivo
  if (persona.fechaAlta && persona.fechaAlta > today) return false;

  if (!persona.fechaBaja) return true;

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

  // Si la fecha de baja es posterior a hoy
  if (persona.fechaBaja > today) {
    return `Activo hasta ${persona.fechaBaja}`;
  }

  // Si la fecha de baja es hoy o pasada
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

  // Si la fecha de baja es posterior a hoy -> ACTIVO; si es hoy o pasada -> INACTIVO
  return persona.fechaBaja > today ? 'ACTIVO' : 'INACTIVO';
};