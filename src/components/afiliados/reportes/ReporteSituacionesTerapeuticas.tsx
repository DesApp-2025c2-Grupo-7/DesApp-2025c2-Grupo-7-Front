import React, { useState } from "react";
import { buscarAfiliadoTitular } from "../../../services/reportesService";
import "./ReporteSituacionesTerapeuticas.css";
import type { Persona } from "../../../types/afiliados";

const ReporteSituacionesTerapeuticas: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Persona[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);

  const handleBuscarAfiliado = async () => {
    if (!busqueda.trim()) {
      setError("Por favor ingrese un criterio de búsqueda");
      return;
    }

    setBuscando(true);
    setError(null);
    setResultadosBusqueda([]);

    try {
      const resultados = await buscarAfiliadoTitular(busqueda);
      setResultadosBusqueda(resultados);

      if (resultados.length === 0) {
        setError("No se encontraron afiliados titulares con ese criterio");
      }
    } catch (err) {
      setError("Error al buscar afiliado. Intente nuevamente.");
      console.error(err);
    } finally {
      setBuscando(false);
    }
  };

  const handleLimpiarBusqueda = () => {
    setResultadosBusqueda([]);
    setBusqueda("");
    setError(null);
  };

  const handleDescargar = () => {
    setMostrarPopup(true);
    setTimeout(() => setMostrarPopup(false), 3000);
  };



  return (
    <div className="reporte-situaciones-container">
      <div className="reporte-header">
        <h2>Reporte de Situaciones Terapéuticas por Grupo Familiar</h2>
        <p className="reporte-descripcion">
          Busque un afiliado titular por credencial, DNI o apellido para visualizar todas las situaciones
          terapéuticas de su grupo familiar.
        </p>
      </div>

      <div className="busqueda-container">
          <div className="busqueda-input-group">
            <input
              type="text"
              className="busqueda-input"
              placeholder="Buscar por credencial, DNI o apellido del TITULAR..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleBuscarAfiliado()}
            />
            <button
              className="btn-buscar"
              onClick={handleBuscarAfiliado}
              disabled={buscando}
            >
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {resultadosBusqueda.length > 0 && (
            <div className="resultados-busqueda">
              <h3>Resultados de búsqueda:</h3>
              <div className="lista-resultados">
                {resultadosBusqueda.map((afiliado) => {
                  const estadoAfiliado = afiliado.fechaBaja ? "De baja" : "Activo";
                  
                  // Recolectar situaciones del titular y del grupo familiar
                  const todasLasPersonas = [afiliado, ...(afiliado.grupoFamiliar?.personas || [])];
                  const todasLasSituaciones = todasLasPersonas.flatMap(
                    (persona: any) => persona.situacionesTerapeuticas || []
                  );
                  const cantidadSituaciones = todasLasSituaciones.length;
                  
                  return (
                    <div key={afiliado.id} className="resultado-item-detallado">
                      <div className="resultado-principal">
                        <div className="resultado-info">
                          <strong className="nombre-afiliado">
                            {afiliado.nombre} {afiliado.apellido} (Titular)
                          </strong>
                          <div className="resultado-detalles">
                            <span>Credencial: {afiliado.credencial}-{afiliado.sufijo}</span>
                            <span>DNI: {afiliado.numeroDocumento}</span>
                            <span>Alta: {new Date(afiliado.fechaAlta).toLocaleDateString("es-AR")}</span>
                            {afiliado.fechaBaja && (
                              <span>Baja: {new Date(afiliado.fechaBaja).toLocaleDateString("es-AR")}</span>
                            )}
                            <span className={`estado-badge ${afiliado.fechaBaja ? 'inactivo' : 'activo'}`}>
                              {estadoAfiliado}
                            </span>
                            {afiliado.grupoFamiliar?.personas && afiliado.grupoFamiliar.personas.length > 0 && (
                              <span>Grupo familiar: {afiliado.grupoFamiliar.personas.length + 1} integrantes</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {cantidadSituaciones > 0 && (
                        <div className="preview-situaciones">
                          <strong>Situaciones terapéuticas del grupo familiar ({cantidadSituaciones}):</strong>
                          {todasLasPersonas.map((persona: any) => {
                            const situacionesPersona = persona.situacionesTerapeuticas || [];
                            if (situacionesPersona.length === 0) return null;
                            
                            return (
                              <div key={persona.id} className="situaciones-por-persona">
                                <h4 className="nombre-persona">
                                  {persona.nombre} {persona.apellido} 
                                  {persona.id === afiliado.id 
                                    ? " (Titular)" 
                                    : ` - ${persona.parentesco || 'Integrante'}`}
                                  {" · "}
                                  Credencial: {persona.credencial}-{persona.sufijo}
                                </h4>
                                <ul className="lista-situaciones-preview">
                                  {situacionesPersona.map((sit: any) => (
                                    <li key={sit.id}>
                                      <span className="diagnostico-preview">{sit.diagnostico || "Sin especificar"}</span>
                                      <span className="fecha-preview">
                                        Inicio: {sit.fechaInicio ? new Date(sit.fechaInicio).toLocaleDateString("es-AR") : "-"}
                                      </span>
                                      {sit.fechaFin && (
                                        <span className="fecha-preview">
                                          Fin: {new Date(sit.fechaFin).toLocaleDateString("es-AR")}
                                        </span>
                                      )}
                                      <span className={`mini-badge ${sit.fechaFin ? 'finalizada' : 'activa'}`}>
                                        {sit.fechaFin ? "Finalizada" : "Activa"}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Botones de exportación por grupo familiar */}
                      <div className="acciones-grupo-familiar">
                        <button className="btn-descargar-small" onClick={handleDescargar} title="Descargar PDF">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          PDF
                        </button>
                        <button className="btn-descargar-small" onClick={handleDescargar} title="Descargar Excel">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          Excel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botones de acciones generales */}
              <div className="acciones-resultados">
                <button className="btn-descargar" onClick={handleDescargar} title="Descargar todos los resultados en PDF">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Descargar PDF
                </button>
                <button className="btn-descargar" onClick={handleDescargar} title="Descargar todos los resultados en Excel">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Descargar Excel
                </button>
                <button className="btn-limpiar-busqueda" onClick={handleLimpiarBusqueda}>
                  Limpiar Búsqueda
                </button>
              </div>
            </div>
          )}
      </div>

      {mostrarPopup && (
        <div className="popup-overlay" onClick={() => setMostrarPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Próximamente</h3>
            <p>La funcionalidad de descarga estará disponible en breve.</p>
            <button className="btn-popup-cerrar" onClick={() => setMostrarPopup(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteSituacionesTerapeuticas;
