import { getApiUrl } from "../config/env";
import type { Persona, ReporteSituacionFamiliar, SituacionTerapeutica } from "../types/afiliados";
import { contarSituacionesActivas } from "../utils/situacionesTerapeuticas";

/**
 * Genera un reporte completo de situaciones terapéuticas para un afiliado titular
 * incluyendo todos los integrantes de su grupo familiar
 */
export const generarReporteSituacionesTerapeuticas = async (
  credencial: string
): Promise<ReporteSituacionFamiliar> => {
  try {
    // Obtener el afiliado titular con su grupo familiar completo
    const response = await fetch(getApiUrl(`/personas/grupo/${credencial}`));
    
    if (!response.ok) {
      throw new Error("No se pudo obtener el grupo familiar del afiliado");
    }

    const data = await response.json();
    const titular: Persona = data;
    const integrantes: Persona[] = data.grupoFamiliar || [];

    // Recopilar todas las personas (titular + integrantes)
    const todasLasPersonas = [titular, ...integrantes];

    // Organizar situaciones por integrante
    const situacionesPorIntegrante = todasLasPersonas.map((persona) => ({
      integrante: persona,
      situaciones: persona.situacionesTerapeuticas || [],
    }));

    // Calcular totales
    const todasLasSituaciones: SituacionTerapeutica[] = situacionesPorIntegrante
      .flatMap((item) => item.situaciones);

    const totalSituaciones = todasLasSituaciones.length;
    const situacionesActivas = contarSituacionesActivas(todasLasSituaciones);

    return {
      titular,
      integrantes,
      situacionesPorIntegrante,
      totalSituaciones,
      situacionesActivas,
    };
  } catch (error) {
    console.error("Error al generar reporte de situaciones terapéuticas:", error);
    throw error;
  }
};

/**
 * Busca afiliados titulares por credencial, nombre o DNI
 * Incluye el grupo familiar completo de cada titular encontrado
 */
export const buscarAfiliadoTitular = async (
  busqueda: string
): Promise<Persona[]> => {
  try {
    const response = await fetch(getApiUrl("/personas"));
    
    if (!response.ok) {
      throw new Error("Error al buscar afiliados");
    }

    const afiliados: Persona[] = await response.json();
    const busquedaLower = busqueda.toLowerCase().trim();

    // Filtrar solo titulares que coincidan con la búsqueda
    const titularesEncontrados = afiliados.filter((afiliado) => {
      if (afiliado.tipoPersona !== "AFILIADO") return false;

      return (
        afiliado.credencial.toLowerCase().includes(busquedaLower) ||
        afiliado.nombre.toLowerCase().includes(busquedaLower) ||
        afiliado.apellido.toLowerCase().includes(busquedaLower) ||
        afiliado.numeroDocumento.includes(busquedaLower) ||
        `${afiliado.nombre} ${afiliado.apellido}`.toLowerCase().includes(busquedaLower)
      );
    });

    // Para cada titular encontrado, obtener su grupo familiar completo
    const titularesConGrupo = await Promise.all(
      titularesEncontrados.map(async (titular) => {
        try {
          const grupoResponse = await fetch(getApiUrl(`/personas/grupo/${titular.credencial}`));
          if (grupoResponse.ok) {
            const grupoCompleto = await grupoResponse.json();
            // El backend devuelve: { ...titular, grupoFamiliar: Persona[] }
            // Necesitamos estructurar correctamente para el frontend
            return {
              ...grupoCompleto,
              grupoFamiliar: {
                personas: grupoCompleto.grupoFamiliar || []
              }
            };
          }
          return {
            ...titular,
            grupoFamiliar: { personas: [] }
          };
        } catch (error) {
          console.warn(`Error obteniendo grupo de ${titular.credencial}:`, error);
          return {
            ...titular,
            grupoFamiliar: { personas: [] }
          };
        }
      })
    );

    return titularesConGrupo;
  } catch (error) {
    console.error("Error al buscar afiliado titular:", error);
    throw error;
  }
};
