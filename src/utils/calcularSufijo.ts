import type { Afiliado } from "../types/afiliados";

/**
 * Calcula el próximo sufijo disponible para un nuevo integrante del grupo familiar
 * @param miembrosGrupo - Array con todos los miembros del grupo familiar (titular + integrantes)
 * @returns string - El próximo sufijo disponible en formato "XX" (ej: "01", "02", "03")
 */
export const calcularProximoSufijo = (miembrosGrupo: Afiliado[]): string => {
  if (!miembrosGrupo || miembrosGrupo.length === 0) {
    // Si no hay miembros, el próximo será 01 (asumiendo que 00 es para el titular)
    return "01";
  }

  // Obtener todos los sufijos actuales y convertirlos a números
  const sufijosActuales = miembrosGrupo
    .map(miembro => miembro.sufijo)
    .filter(sufijo => sufijo !== undefined && sufijo !== null)
    .map(sufijo => parseInt(sufijo.toString(), 10))
    .filter(sufijo => !isNaN(sufijo))
    .sort((a, b) => a - b);

  console.log('Sufijos actuales encontrados:', sufijosActuales);

  // Si no hay sufijos válidos, empezar desde 01
  if (sufijosActuales.length === 0) {
    return "01";
  }

  // Encontrar el próximo sufijo disponible
  let proximoSufijo = 1; // Empezar desde 1 porque 0 es para el titular

  for (const sufijo of sufijosActuales) {
    if (sufijo === proximoSufijo) {
      proximoSufijo++;
    } else if (sufijo > proximoSufijo) {
      // Encontramos un hueco, usar el sufijo actual
      break;
    }
  }

  // Formatear como string de 2 dígitos con ceros a la izquierda
  return proximoSufijo.toString().padStart(2, '0');
};

/**
 * Obtiene el sufijo más alto usado en el grupo familiar
 * @param miembrosGrupo - Array con todos los miembros del grupo familiar
 * @returns number - El sufijo más alto encontrado, o 0 si no hay miembros
 */
export const obtenerSufijoMaximo = (miembrosGrupo: Afiliado[]): number => {
  if (!miembrosGrupo || miembrosGrupo.length === 0) {
    return 0;
  }

  const sufijos = miembrosGrupo
    .map(miembro => miembro.sufijo)
    .filter(sufijo => sufijo !== undefined && sufijo !== null)
    .map(sufijo => parseInt(sufijo.toString(), 10))
    .filter(sufijo => !isNaN(sufijo));

  return sufijos.length > 0 ? Math.max(...sufijos) : 0;
};

/**
 * Valida si un sufijo está disponible en el grupo familiar
 * @param sufijo - El sufijo a validar
 * @param miembrosGrupo - Array con todos los miembros del grupo familiar
 * @returns boolean - true si el sufijo está disponible, false si ya está en uso
 */
export const esSufijoDisponible = (sufijo: string | number, miembrosGrupo: Afiliado[]): boolean => {
  const sufijoStr = sufijo.toString().padStart(2, '0');
  return !miembrosGrupo.some(miembro => 
    miembro.sufijo?.toString().padStart(2, '0') === sufijoStr
  );
};