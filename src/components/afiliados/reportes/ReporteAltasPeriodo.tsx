import React, { useState } from "react";
import "./ReporteAltasPeriodo.css";

const ReporteAltasPeriodo: React.FC = () => {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [mostrarPopup, setMostrarPopup] = useState(false);

  return (
    <div className="reporte-altas-container">
      <div className="reporte-altas-header">
        <h2>Reporte de Altas de Afiliados por Periodo</h2>
        <p className="reporte-altas-descripcion">
          Seleccione un rango de fechas para ver todos los afiliados dados de alta en ese periodo.
        </p>
      </div>

      <div className="filtros-altas">
        <div className="filtro-fecha-group">
          <div className="filtro-fecha-item">
            <label htmlFor="fechaDesde">Fecha desde:</label>
            <input
              id="fechaDesde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          <div className="filtro-fecha-item">
            <label htmlFor="fechaHasta">Fecha hasta:</label>
            <input
              id="fechaHasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

          <button 
            className="btn-generar-reporte-altas"
            disabled={!fechaDesde || !fechaHasta}
          >
            Generar Reporte
          </button>
        </div>
      </div>

      <div className="proximamente-container">
        <div className="proximamente-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h3>Próximamente</h3>
          <p>Esta funcionalidad estará disponible en breve.</p>
          <p className="proximamente-detalle">
            Podrás generar reportes de altas de afiliados filtrados por periodo,
            con la posibilidad de exportar los resultados en PDF o Excel.
          </p>
        </div>
      </div>


    </div>
  );
};

export default ReporteAltasPeriodo;
