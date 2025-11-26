import React from "react";
import "./FiltrosSituaciones.css";

interface FiltrosSituacionesProps {
  fechaDesde: string;
  fechaHasta: string;
  soloActivas: boolean;
  busquedaDiagnostico: string;
  onFechaDesdeChange: (fecha: string) => void;
  onFechaHastaChange: (fecha: string) => void;
  onSoloActivasChange: (solo: boolean) => void;
  onBusquedaDiagnosticoChange: (busqueda: string) => void;
  onLimpiarFiltros: () => void;
}

const FiltrosSituaciones: React.FC<FiltrosSituacionesProps> = ({
  fechaDesde,
  fechaHasta,
  soloActivas,
  busquedaDiagnostico,
  onFechaDesdeChange,
  onFechaHastaChange,
  onSoloActivasChange,
  onBusquedaDiagnosticoChange,
  onLimpiarFiltros,
}) => {
  return (
    <div className="filtros-situaciones">
      <h4>🔍 Filtros</h4>
      <div className="filtros-grid">
        <div className="filtro-item">
          <label htmlFor="fechaDesde">Fecha desde:</label>
          <input
            id="fechaDesde"
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange(e.target.value)}
          />
        </div>

        <div className="filtro-item">
          <label htmlFor="fechaHasta">Fecha hasta:</label>
          <input
            id="fechaHasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange(e.target.value)}
          />
        </div>

        <div className="filtro-item">
          <label htmlFor="diagnostico">Diagnóstico:</label>
          <input
            id="diagnostico"
            type="text"
            placeholder="Buscar diagnóstico..."
            value={busquedaDiagnostico}
            onChange={(e) => onBusquedaDiagnosticoChange(e.target.value)}
          />
        </div>

        <div className="filtro-item checkbox-item">
          <label>
            <input
              type="checkbox"
              checked={soloActivas}
              onChange={(e) => onSoloActivasChange(e.target.checked)}
            />
            Solo situaciones activas
          </label>
        </div>

        <div className="filtro-item">
          <button className="btn-limpiar" onClick={onLimpiarFiltros}>
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltrosSituaciones;
