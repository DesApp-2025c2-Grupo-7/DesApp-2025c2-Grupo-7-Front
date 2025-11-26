import type { SituacionTerapeutica } from "../types/afiliados";

/**
 * Verifica si una situación terapéutica está activa (no tiene fecha de fin)
 */
export const esSituacionActiva = (situacion: SituacionTerapeutica): boolean => {
  return situacion.fechaFin === null || situacion.fechaFin === undefined;
};

/**
 * Ordena situaciones terapéuticas por fecha de inicio (más reciente primero)
 */
export const ordenarSituacionesPorFecha = (
  situaciones: SituacionTerapeutica[]
): SituacionTerapeutica[] => {
  return [...situaciones].sort((a, b) => {
    if (!a.fechaInicio) return 1;
    if (!b.fechaInicio) return -1;
    return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
  });
};

/**
 * Cuenta cuántas situaciones están activas
 */
export const contarSituacionesActivas = (
  situaciones: SituacionTerapeutica[]
): number => {
  return situaciones.filter(esSituacionActiva).length;
};

/**
 * Filtra situaciones por rango de fechas (fecha de inicio)
 */
export const filtrarSituacionesPorFecha = (
  situaciones: SituacionTerapeutica[],
  fechaDesde?: string,
  fechaHasta?: string
): SituacionTerapeutica[] => {
  return situaciones.filter((sit) => {
    if (!sit.fechaInicio) return false;

    const fechaInicio = new Date(sit.fechaInicio);

    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      if (fechaInicio < desde) return false;
    }

    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      if (fechaInicio > hasta) return false;
    }

    return true;
  });
};

/**
 * Filtra situaciones por diagnóstico (búsqueda parcial case-insensitive)
 */
export const filtrarSituacionesPorDiagnostico = (
  situaciones: SituacionTerapeutica[],
  busqueda: string
): SituacionTerapeutica[] => {
  if (!busqueda.trim()) return situaciones;

  const busquedaLower = busqueda.toLowerCase().trim();
  return situaciones.filter((sit) =>
    sit.diagnostico?.toLowerCase().includes(busquedaLower)
  );
};

/**
 * Formatea una fecha para mostrar (DD/MM/YYYY)
 */
export const formatearFecha = (fecha: string | null): string => {
  if (!fecha) return "-";
  
  try {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};
