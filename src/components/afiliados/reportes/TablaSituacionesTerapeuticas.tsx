import React, { useState } from "react";
import type { Persona, SituacionTerapeutica } from "../../../types/afiliados";
import {
  esSituacionActiva,
  formatearFecha,
} from "../../../utils/situacionesTerapeuticas";
import "./TablaSituacionesTerapeuticas.css";

interface TablaSituacionesTerapeuticasProps {
  situacionesPorIntegrante: {
    integrante: Persona;
    situaciones: SituacionTerapeutica[];
  }[];
}

const TablaSituacionesTerapeuticas: React.FC<
  TablaSituacionesTerapeuticasProps
> = ({ situacionesPorIntegrante }) => {
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());

  const toggleExpansion = (integranteId: number) => {
    setExpandidos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(integranteId)) {
        newSet.delete(integranteId);
      } else {
        newSet.add(integranteId);
      }
      return newSet;
    });
  };

  const obtenerParentesco = (integrante: Persona): string => {
    if (integrante.tipoPersona === "AFILIADO") return "Titular";
    return integrante.parentesco || "Integrante";
  };

  return (
    <div className="tabla-situaciones-container">
      {situacionesPorIntegrante.map(({ integrante, situaciones }) => {
        const isExpanded = expandidos.has(integrante.id);
        const cantidadSituaciones = situaciones.length;
        const situacionesActivas = situaciones.filter(esSituacionActiva).length;

        return (
          <div key={integrante.id} className="integrante-section">
            <div
              className="integrante-header"
              onClick={() => toggleExpansion(integrante.id)}
            >
              <div className="integrante-info">
                <span className="toggle-icon">{isExpanded ? "▼" : "▶"}</span>
                <span className="integrante-nombre">
                  {integrante.nombre} {integrante.apellido}
                </span>
                <span className="integrante-parentesco">
                  ({obtenerParentesco(integrante)})
                </span>
                <span className="situaciones-count">
                  {cantidadSituaciones}{" "}
                  {cantidadSituaciones === 1 ? "situación" : "situaciones"}
                </span>
                {situacionesActivas > 0 && (
                  <span className="badge-activas">
                    {situacionesActivas} activa{situacionesActivas > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="integrante-content">
                {situaciones.length > 0 ? (
                  <table className="situaciones-table">
                    <thead>
                      <tr>
                        <th>Diagnóstico</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {situaciones.map((sit) => {
                        const activa = esSituacionActiva(sit);
                        return (
                          <tr key={sit.id} className={activa ? "activa" : ""}>
                            <td className="diagnostico">
                              {sit.diagnostico || "Sin especificar"}
                            </td>
                            <td>{formatearFecha(sit.fechaInicio)}</td>
                            <td>{formatearFecha(sit.fechaFin)}</td>
                            <td>
                              <span
                                className={`estado-badge ${
                                  activa ? "estado-activa" : "estado-finalizada"
                                }`}
                              >
                                {activa ? "🟢 Activa" : "⚪ Finalizada"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="sin-situaciones">
                    No hay situaciones terapéuticas registradas
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {situacionesPorIntegrante.length === 0 && (
        <p className="sin-datos">No hay datos para mostrar</p>
      )}
    </div>
  );
};

export default TablaSituacionesTerapeuticas;
