import React, { useState } from "react";
import { buscarAfiliadoTitular } from "../../../services/reportesService";
import "./ReporteSituacionesTerapeuticas.css";
import type { Persona } from "../../../types/afiliados";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ReporteSituacionesTerapeuticas: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Persona[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const descargarPDF = (afiliado?: Persona) => {
    const doc = new jsPDF();
    const afiliadosParaExportar = afiliado ? [afiliado] : resultadosBusqueda;

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Situaciones Terapéuticas", 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 14, 22);

    let yPos = 30;

    afiliadosParaExportar.forEach((afiliadoActual, index) => {
      if (index > 0) {
        doc.addPage();
        yPos = 20;
      }

      // Información del titular
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Titular: ${afiliadoActual.nombre} ${afiliadoActual.apellido}`, 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Credencial: ${afiliadoActual.credencial}-${afiliadoActual.sufijo}`, 14, yPos);
      doc.text(`DNI: ${afiliadoActual.numeroDocumento}`, 80, yPos);
      doc.text(`Estado: ${afiliadoActual.fechaBaja ? "De baja" : "Activo"}`, 140, yPos);
      yPos += 7;

      // Recolectar todas las personas y situaciones
      const todasLasPersonas = [afiliadoActual, ...(afiliadoActual.grupoFamiliar?.personas || [])];
      const todasLasSituaciones: any[] = [];

      todasLasPersonas.forEach((persona: any) => {
        const situacionesPersona = persona.situacionesTerapeuticas || [];
        situacionesPersona.forEach((sit: any) => {
          todasLasSituaciones.push({
            integrante: `${persona.nombre} ${persona.apellido}`,
            credencial: `${persona.credencial}-${persona.sufijo}`,
            parentesco: persona.id === afiliadoActual.id ? "Titular" : persona.parentesco || "Integrante",
            diagnostico: sit.diagnostico || "Sin especificar",
            fechaInicio: sit.fechaInicio ? new Date(sit.fechaInicio).toLocaleDateString("es-AR") : "-",
            fechaFin: sit.fechaFin ? new Date(sit.fechaFin).toLocaleDateString("es-AR") : "-",
            estado: sit.fechaFin ? "Finalizada" : "Activa"
          });
        });
      });

      if (todasLasSituaciones.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [["Integrante", "Credencial", "Parentesco", "Diagnóstico", "Inicio", "Fin", "Estado"]],
          body: todasLasSituaciones.map((sit) => [
            sit.integrante,
            sit.credencial,
            sit.parentesco,
            sit.diagnostico,
            sit.fechaInicio,
            sit.fechaFin,
            sit.estado
          ]),
          styles: { fontSize: 8 },
          headStyles: { fillColor: [75, 129, 216] },
          margin: { left: 14, right: 14 }
        });
      } else {
        doc.text("No hay situaciones terapéuticas registradas", 14, yPos);
      }
    });

    const nombreArchivo = afiliado 
      ? `situaciones_${afiliado.apellido}_${afiliado.credencial}.pdf`
      : `situaciones_terapeuticas_${new Date().toISOString().split("T")[0]}.pdf`;
    
    doc.save(nombreArchivo);
  };

  const descargarExcel = (afiliado?: Persona) => {
    const afiliadosParaExportar = afiliado ? [afiliado] : resultadosBusqueda;
    const datosExcel: any[] = [];

    afiliadosParaExportar.forEach((afiliadoActual) => {
      const todasLasPersonas = [afiliadoActual, ...(afiliadoActual.grupoFamiliar?.personas || [])];
      
      todasLasPersonas.forEach((persona: any) => {
        const situacionesPersona = persona.situacionesTerapeuticas || [];
        
        if (situacionesPersona.length === 0) {
          datosExcel.push({
            "Titular": `${afiliadoActual.nombre} ${afiliadoActual.apellido}`,
            "Credencial Titular": `${afiliadoActual.credencial}-${afiliadoActual.sufijo}`,
            "DNI Titular": afiliadoActual.numeroDocumento,
            "Estado Titular": afiliadoActual.fechaBaja ? "De baja" : "Activo",
            "Integrante": `${persona.nombre} ${persona.apellido}`,
            "Credencial Integrante": `${persona.credencial}-${persona.sufijo}`,
            "Parentesco": persona.id === afiliadoActual.id ? "Titular" : persona.parentesco || "Integrante",
            "Diagnóstico": "Sin situaciones registradas",
            "Fecha Inicio": "",
            "Fecha Fin": "",
            "Estado Situación": ""
          });
        } else {
          situacionesPersona.forEach((sit: any) => {
            datosExcel.push({
              "Titular": `${afiliadoActual.nombre} ${afiliadoActual.apellido}`,
              "Credencial Titular": `${afiliadoActual.credencial}-${afiliadoActual.sufijo}`,
              "DNI Titular": afiliadoActual.numeroDocumento,
              "Estado Titular": afiliadoActual.fechaBaja ? "De baja" : "Activo",
              "Integrante": `${persona.nombre} ${persona.apellido}`,
              "Credencial Integrante": `${persona.credencial}-${persona.sufijo}`,
              "Parentesco": persona.id === afiliadoActual.id ? "Titular" : persona.parentesco || "Integrante",
              "Diagnóstico": sit.diagnostico || "Sin especificar",
              "Fecha Inicio": sit.fechaInicio ? new Date(sit.fechaInicio).toLocaleDateString("es-AR") : "-",
              "Fecha Fin": sit.fechaFin ? new Date(sit.fechaFin).toLocaleDateString("es-AR") : "-",
              "Estado Situación": sit.fechaFin ? "Finalizada" : "Activa"
            });
          });
        }
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Situaciones");

    const nombreArchivo = afiliado 
      ? `situaciones_${afiliado.apellido}_${afiliado.credencial}.xlsx`
      : `situaciones_terapeuticas_${new Date().toISOString().split("T")[0]}.xlsx`;

    XLSX.writeFile(workbook, nombreArchivo);
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
                        <button className="btn-descargar-small" onClick={() => descargarPDF(afiliado)} title="Descargar PDF">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          PDF
                        </button>
                        <button className="btn-descargar-small" onClick={() => descargarExcel(afiliado)} title="Descargar Excel">
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
                <button className="btn-descargar" onClick={() => descargarPDF()} title="Descargar todos los resultados en PDF">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Descargar PDF
                </button>
                <button className="btn-descargar" onClick={() => descargarExcel()} title="Descargar todos los resultados en Excel">
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
    </div>
  );
};

export default ReporteSituacionesTerapeuticas;
