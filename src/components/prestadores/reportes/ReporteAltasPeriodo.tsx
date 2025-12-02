import React, { useState, useMemo, useEffect } from "react";
import "./ReporteAltasPeriodo.css";
import { getApiUrl } from "../../../config/env";

// EXCEL / XLSX
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// PAGINACIÓN
import Paginacion from "../../genericos/Paginacion";

// Tipos
interface Prestador {
  id: number;
  numeroCUIL: string;
  nombreCompleto: string;
  esProfesionalIndependiente: boolean;
  especialidades?: { id: number; nombre: string }[];
  fechaAlta: string;
  fechaBaja: string | null;
  email?: string[];
  telefono?: string[];
}

const ReporteAltasPorPeriodo: React.FC = () => {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [reporteGenerado, setReporteGenerado] = useState(false);

  // filtros y paginación
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Generar reporte
  const generarReporte = async () => {
    if (!fechaDesde || !fechaHasta) {
      setError("Debe seleccionar ambas fechas");
      return;
    }
    if (new Date(fechaDesde) > new Date(fechaHasta)) {
      setError("La fecha desde no puede ser mayor que la fecha hasta");
      return;
    }

    setCargando(true);
    setError("");
    setReporteGenerado(false);

    try {
      const url = getApiUrl(
        `/prestadores/filtrar?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`
      );

      const response = await fetch(url);

      if (!response.ok) throw new Error("Error al obtener datos");

      const data: Prestador[] = await response.json();
      setPrestadores(data);
      setReporteGenerado(true);
      setPage(1); // reset page
    } catch (err) {
      console.error(err);
      setError("Error al generar reporte");
    } finally {
      setCargando(false);
    }
  };

  // Filtros + Ordenamiento
  const prestadoresFiltrados = useMemo(() => {
    let filtrados = [...prestadores];

    // filtro búsqueda
    if (search.trim() !== "") {
      const t = search.toLowerCase();
      filtrados = filtrados.filter((p) => {
        return (
          p.nombreCompleto.toLowerCase().includes(t) ||
          p.numeroCUIL.includes(t) ||
          p.especialidades?.some((e) => e.nombre.toLowerCase().includes(t))
        );
      });
    }

    // ordenamiento
    if (sortColumn) {
      filtrados.sort((a: any, b: any) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        const isDateColumn = sortColumn === "fechaAlta";

        if (isDateColumn) {
          const da = valA ? new Date(valA).getTime() : 0;
          const db = valB ? new Date(valB).getTime() : 0;
          return sortOrder === "asc" ? da - db : db - da;
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return sortOrder === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortOrder === "asc"
          ? (valA || 0) - (valB || 0)
          : (valB || 0) - (valA || 0);
      });
    }

    return filtrados;
  }, [prestadores, search, sortColumn, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(prestadoresFiltrados.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  useEffect(() => {
    setPage(1);
  }, [prestadores, search, sortColumn, sortOrder]);

  const paginados = prestadoresFiltrados.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Altas de Prestadores", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["CUIL", "Nombre Completo", "Especialidades", "Fecha Alta", "Fecha Baja"]],
      body: prestadoresFiltrados.map((p) => [
        p.numeroCUIL,
        p.nombreCompleto,
        p.especialidades?.map((e) => e.nombre).join(", ") || "-",
        formatearFecha(p.fechaAlta),
        p.fechaBaja ? formatearFecha(p.fechaBaja) : "-",
      ]),
    });

    doc.save(`reporte_altas_prestadores_${fechaDesde}_${fechaHasta}.pdf`);
  };

  // Exportar Excel
  const exportarExcel = () => {
    const rows = prestadoresFiltrados.map((p) => ({
      CUIL: p.numeroCUIL,
      Nombre: p.nombreCompleto,
      Especialidades: p.especialidades?.map((e) => e.nombre).join(", ") || "-",
      FechaAlta: formatearFecha(p.fechaAlta),
      FechaBaja: p.fechaBaja ? formatearFecha(p.fechaBaja) : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = { Sheets: { datos: worksheet }, SheetNames: ["datos"] };
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(blob, `reporte_altas_prestadores_${fechaDesde}_${fechaHasta}.xlsx`);
  };

  // Exportar CSV
  const exportarCSV = () => {
    const headers = ["CUIL", "Nombre", "Especialidades", "Fecha Alta", "Fecha Baja"].join(",");
    const rows = prestadoresFiltrados
      .map(
        (p) =>
          `"${p.numeroCUIL}","${p.nombreCompleto}","${p.especialidades?.map((e) => e.nombre).join(", ") || "-"}","${formatearFecha(
            p.fechaAlta
          )}","${p.fechaBaja ? formatearFecha(p.fechaBaja) : "-"}"`
      )
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `reporte_altas_prestadores_${fechaDesde}_${fechaHasta}.csv`);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    const container = document.querySelector(".reporte-altas-container");
    if (container) container.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="reporte-altas-container">
      <div className="reporte-altas-header">
        <h2>Reporte de Altas de Prestadores por Periodo</h2>
        <p className="reporte-altas-descripcion">
          Seleccione un rango de fechas para ver todos los prestadores dados de alta.
        </p>
      </div>

      {/* FILTROS */}
      <div className="filtros-altas">
        <div className="filtro-fecha-group">
          <div className="filtro-fecha-item">
            <label>Fecha Desde</label>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          </div>

          <div className="filtro-fecha-item">
            <label>Fecha Hasta</label>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </div>

          <button className="btn-generar-reporte-altas" onClick={generarReporte} disabled={cargando}>
            {cargando ? "Generando..." : "Generar Reporte"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* RESULTADOS */}
      {reporteGenerado && (
        <>
          <div className="results-header">
            <div className="results-info">
              <h3>Resultados</h3>
              <p>
                {prestadoresFiltrados.length} prestador(es) del {formatearFecha(fechaDesde)} al{" "}
                {formatearFecha(fechaHasta)}
              </p>
            </div>

            {prestadoresFiltrados.length > 0 && (
              <div className="export-buttons">
                <button className="btn-export" onClick={exportarPDF}>
                  PDF
                </button>
                <button className="btn-export" onClick={exportarExcel}>
                  Excel
                </button>
                <button className="btn-export" onClick={exportarCSV}>
                  CSV
                </button>
              </div>
            )}
          </div>

          {/* BUSCADOR */}
          <div
            style={{
              margin: "0 0 1rem 0",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div className="input-busqueda-container">
              <span
                className="icono-busqueda"
                style={{
                  left: 12,
                  top: "50%",
                  position: "absolute",
                  transform: "translateY(-50%)",
                }}
              >
                🔍
              </span>
              <input
                className="input-busqueda"
                type="text"
                placeholder="Buscar por CUIL, nombre o especialidad..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ marginLeft: "auto", color: "#606060", fontSize: "0.9rem" }}>
              Mostrando {paginados.length} de {prestadoresFiltrados.length}
            </div>
          </div>

          {/* TABLA */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("numeroCUIL")} style={{ cursor: "pointer" }}>
                    CUIL {sortColumn === "numeroCUIL" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("nombreCompleto")} style={{ cursor: "pointer" }}>
                    Nombre Completo {sortColumn === "nombreCompleto" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th>Especialidades</th>
                  <th onClick={() => handleSort("fechaAlta")} style={{ cursor: "pointer" }}>
                    Fecha Alta {sortColumn === "fechaAlta" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th>Fecha Baja</th>
                </tr>
              </thead>

              <tbody>
                {paginados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.numeroCUIL}</td>
                    <td>{p.nombreCompleto}</td>
                    <td>{p.especialidades?.map((e) => e.nombre).join(", ") || "-"}</td>
                    <td>{formatearFecha(p.fechaAlta)}</td>
                    <td>{p.fechaBaja ? formatearFecha(p.fechaBaja) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINADOR */}
          {prestadoresFiltrados.length > pageSize && (
            <div style={{ marginTop: "1rem" }}>
              <Paginacion totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReporteAltasPorPeriodo;
