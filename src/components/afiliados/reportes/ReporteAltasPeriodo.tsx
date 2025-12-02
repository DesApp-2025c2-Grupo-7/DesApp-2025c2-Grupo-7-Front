import React, { useState, useMemo, useEffect } from "react";
import "./ReporteAltasPeriodo.css";
import { getApiUrl } from "../../../config/env";

// EXCEL / XLSX
import * as XLSX from "xlsx";

// PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// PAGINACIÓN
import Paginacion from "../../genericos/Paginacion";

// Tipos
interface Direccion {
  id: number;
  calle: string;
  numero: string;
  localidad: string;
  codigoPostal: string;
  personaId: number;
}

interface Afiliado {
  id: number;
  credencial: string;
  sufijo: string;
  tipoPersona: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string[];
  email: string[];
  parentesco: string;
  direccion: Direccion[];
  grupoFamiliarId: number;
  planMedico: string;
  fechaAlta: string;
  fechaBaja: string | null;
}

const ReporteAltasPeriodo: React.FC = () => {
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [reporteGenerado, setReporteGenerado] = useState(false);

  // filtros y paginación
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // FORMAT FECHA
  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // GENERAR REPORTE
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
        `/personas/filtrar?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`
      );

      const response = await fetch(url);

      if (!response.ok) throw new Error("Error al obtener datos");

      const data: Afiliado[] = await response.json();
      setAfiliados(data);
      setReporteGenerado(true);
      setPage(1); // reset page
    } catch (err) {
      console.error(err);
      setError("Error al generar reporte");
    } finally {
      setCargando(false);
    }
  };

  // FILTROS + ORDENAMIENTO
  const afiliadosFiltrados = useMemo(() => {
    let filtrados = [...afiliados];

    // FILTRO
    if (search.trim() !== "") {
      const t = search.toLowerCase();
      filtrados = filtrados.filter((a) => {
        return (
          a.nombre.toLowerCase().includes(t) ||
          a.apellido.toLowerCase().includes(t) ||
          a.numeroDocumento.toLowerCase().includes(t) ||
          `${a.credencial}-${a.sufijo}`.toLowerCase().includes(t)
        );
      });
    }

    // ORDEN
    if (sortColumn) {
      filtrados.sort((a: any, b: any) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        const isDateColumn =
          sortColumn === "fechaAlta" || sortColumn === "fechaNacimiento";

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
  }, [afiliados, search, sortColumn, sortOrder]);

  const totalPages = Math.max(
    1,
    Math.ceil(afiliadosFiltrados.length / pageSize)
  );

  // clamp page
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  // reset page al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [afiliados, search, sortColumn, sortOrder]);

  const paginados = afiliadosFiltrados.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // SORT COLUMNS
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // DOWNLOADS → PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Altas de Afiliados", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Credencial",
          "DNI",
          "Apellido y Nombre",
          "Email",
          "Teléfono",
          "Fecha Alta",
          "Plan",
          "Parentesco",
        ],
      ],
      body: afiliadosFiltrados.map((a) => [
        `${a.credencial}-${a.sufijo}`,
        a.numeroDocumento,
        `${a.apellido}, ${a.nombre}`,
        a.email[0] || "",
        a.telefono[0] || "",
        formatearFecha(a.fechaAlta),
        a.planMedico,
        a.parentesco,
      ]),
    });

    doc.save(`reporte_altas_${fechaDesde}_${fechaHasta}.pdf`);
  };

  // EXCEL
  const exportarExcel = () => {
    const rows = afiliadosFiltrados.map((a) => ({
      Credencial: `${a.credencial}-${a.sufijo}`,
      DNI: a.numeroDocumento,
      Apellido: a.apellido,
      Nombre: a.nombre,
      Email: a.email[0] || "",
      Teléfono: a.telefono[0] || "",
      FechaAlta: formatearFecha(a.fechaAlta),
      Plan: a.planMedico,
      Parentesco: a.parentesco,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = { Sheets: { datos: worksheet }, SheetNames: ["datos"] };

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, `reporte_altas_${fechaDesde}_${fechaHasta}.xlsx`);
  };

  // CSV
  const exportarCSV = () => {
    const headers = [
      "Credencial",
      "DNI",
      "Apellido",
      "Nombre",
      "Email",
      "Teléfono",
      "Fecha Alta",
      "Plan",
      "Parentesco",
    ].join(",");

    const rows = afiliadosFiltrados
      .map(
        (a) =>
          `"${a.credencial}-${a.sufijo}","${a.numeroDocumento}","${a.apellido}","${a.nombre}","${a.email[0] || ""}","${a.telefono[0] || ""}","${formatearFecha(
            a.fechaAlta
          )}","${a.planMedico}","${a.parentesco}"`
      )
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + headers + "\n" + rows], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(blob, `reporte_altas_${fechaDesde}_${fechaHasta}.csv`);
  };

  // PAGINACIÓN
  const handlePageChange = (p: number) => {
    setPage(p);
    const container = document.querySelector(".reporte-altas-container");
    if (container)
      container.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="reporte-altas-container">
      <div className="reporte-altas-header">
        <h2>Reporte de Altas de Afiliados por Periodo</h2>
        <p className="reporte-altas-descripcion">
          Seleccione un rango de fechas para ver todos los afiliados dados de
          alta.
        </p>
      </div>

      {/* FILTROS */}
      <div className="filtros-altas">
        <div className="filtro-fecha-group">
          <div className="filtro-fecha-item">
            <label>Fecha Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          <div className="filtro-fecha-item">
            <label>Fecha Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

          <button
            className="btn-generar-reporte-altas"
            onClick={generarReporte}
            disabled={cargando}
          >
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
                {afiliadosFiltrados.length} afiliado(s) del{" "}
                {formatearFecha(fechaDesde)} al {formatearFecha(fechaHasta)}
              </p>
            </div>

            {afiliadosFiltrados.length > 0 && (
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
                placeholder="Buscar por credencial, DNI, nombre, apellido..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div
              style={{
                marginLeft: "auto",
                color: "#606060",
                fontSize: "0.9rem",
              }}
            >
              Mostrando {paginados.length} de {afiliadosFiltrados.length}
            </div>
          </div>

          {/* TABLA */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("credencial")}
                    style={{ cursor: "pointer" }}
                  >
                    Credencial{" "}
                    {sortColumn === "credencial"
                      ? sortOrder === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("numeroDocumento")}
                    style={{ cursor: "pointer" }}
                  >
                    DNI{" "}
                    {sortColumn === "numeroDocumento"
                      ? sortOrder === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    onClick={() => handleSort("apellido")}
                    style={{ cursor: "pointer" }}
                  >
                    Apellido y Nombre{" "}
                    {sortColumn === "apellido"
                      ? sortOrder === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th
                    onClick={() => handleSort("fechaAlta")}
                    style={{ cursor: "pointer" }}
                  >
                    Fecha Alta{" "}
                    {sortColumn === "fechaAlta"
                      ? sortOrder === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th>Plan</th>
                  <th>Parentesco</th>
                </tr>
              </thead>

              <tbody>
                {paginados.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.credencial}-{a.sufijo}
                    </td>
                    <td>{a.numeroDocumento}</td>
                    <td>
                      {a.apellido}, {a.nombre}
                    </td>
                    <td>{a.email[0] || "-"}</td>
                    <td>{a.telefono[0] || "-"}</td>
                    <td>{formatearFecha(a.fechaAlta)}</td>
                    <td>
                      <span className="badge">{a.planMedico}</span>
                    </td>
                    <td>
                      <span
                        className={`status ${
                          a.parentesco?.toLowerCase() || ""
                        }`}
                      >
                        {a.parentesco}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINADOR */}
          {afiliadosFiltrados.length > pageSize && (
            <div style={{ marginTop: "1rem" }}>
              <Paginacion
                totalPages={totalPages}
                currentPage={page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReporteAltasPeriodo;
