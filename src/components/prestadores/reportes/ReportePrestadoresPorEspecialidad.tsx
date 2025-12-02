import React, { useState, useMemo } from "react";
import type { Prestador } from "../../../types/prestadores";
import "./ReportesPretadoresPorEspecialidad.css";
import Paginacion from "../../genericos/Paginacion";
import Button from "../../genericos/Button";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

interface ReportePrestadoresPorEspecialidadProps {
  prestadores: Prestador[];
}

const ReportePrestadoresPorEspecialidad: React.FC<ReportePrestadoresPorEspecialidadProps> = ({
  prestadores,
}) => {
  const [search, setSearch] = useState("");
  const [especialidadFiltro, setEspecialidadFiltro] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const navigate = useNavigate();

  // Filtrado global por nombre o CUIL y por especialidad
  const prestadoresFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prestadores.filter((p) =>
      (!q || p.nombreCompleto.toLowerCase().includes(q) || p.numeroCUIL.includes(q)) &&
      (!especialidadFiltro || p.especialidades?.some(e => e.nombre === especialidadFiltro))
    );
  }, [prestadores, search, especialidadFiltro]);

  // Agrupar por especialidad (solo para mostrar)
  const agrupadosPorEspecialidad = useMemo(() => {
    const map: Record<string, Prestador[]> = {};
    prestadoresFiltrados.forEach((p) => {
      p.especialidades?.forEach((e) => {
        if (!especialidadFiltro || e.nombre === especialidadFiltro) {
          if (!map[e.nombre]) map[e.nombre] = [];
          map[e.nombre].push(p);
        }
      });
    });
    return map;
  }, [prestadoresFiltrados, especialidadFiltro]);

  const especialidades = Object.keys(agrupadosPorEspecialidad).sort();
  const totalPages = Math.max(1, Math.ceil(especialidades.length / pageSize));
  const especialidadesVisibles = especialidades.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Exportar PDF general
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text(`Prestadores Filtrados`, 14, 15);

    const body: any[] = [];
    prestadoresFiltrados.forEach(p => {
      const esp = p.especialidades?.map(e => e.nombre).join(", ") || "-";
      body.push([p.nombreCompleto, p.numeroCUIL, esp, p.esProfesionalIndependiente ? "Profesional" : "Centro", p.fechaBaja ? "No" : "Sí"]);
    });

    autoTable(doc, {
      startY: 25,
      head: [["Nombre", "CUIL", "Especialidades", "Tipo", "Activo"]],
      body,
    });

    doc.save(`prestadores_filtrados.pdf`);
  };

  // Exportar CSV general
  const exportarCSV = () => {
    const headers = ["Nombre", "CUIL", "Especialidades", "Tipo", "Activo"];
    const rows = prestadoresFiltrados
      .map(p =>
        `"${p.nombreCompleto}","${p.numeroCUIL}","${p.especialidades?.map(e => e.nombre).join(", ") || "-"}","${p.esProfesionalIndependiente ? "Profesional" : "Centro"}","${p.fechaBaja ? "No" : "Sí"}"`
      )
      .join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + headers.join(",") + "\n" + rows], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `prestadores_filtrados.csv`);
  };

  return (
    <div className="reporte-especialidad-container">
      <h2>Reporte de Prestadores por Especialidad</h2>

      <div className="filtros-busqueda">
        <div className="input-busqueda-container">
          <span className="icono-busqueda">🔍</span>
          <input
            className="input-busqueda"
            type="text"
            placeholder="Buscar prestador por nombre o CUIL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filtro-especialidad">
          <label>Filtrar por Especialidad:</label>
          <select
            value={especialidadFiltro}
            onChange={(e) => { setEspecialidadFiltro(e.target.value); setPage(1); }}
          >
            <option value="">Todas</option>
            {Array.from(new Set(prestadores.flatMap(p => p.especialidades?.map(e => e.nombre) || [])))
              .sort()
              .map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
          </select>
        </div>
        <div className="export-buttons-general">
          <Button variant="primary" size="small" onClick={exportarPDF}>
            Exportar PDF
          </Button>
          <Button variant="secondary" size="small" onClick={exportarCSV}>
            Exportar CSV
          </Button>
        </div>
      </div>

      {especialidadesVisibles.length === 0 && (
        <p className="no-result">No se encontraron prestadores.</p>
      )}

      {especialidadesVisibles.map((esp) => (
        <div key={esp} className="especialidad-card">
          <h3>{esp}</h3>
          <div className="table-wrapper">
            <table className="table-especialidad">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>CUIL</th>
                  <th>Tipo</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {agrupadosPorEspecialidad[esp].map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombreCompleto}</td>
                    <td>{p.numeroCUIL}</td>
                    <td>{p.esProfesionalIndependiente ? "Profesional" : "Centro"}</td>
                    <td>{p.fechaBaja ? "No" : "Sí"}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => navigate(`/prestadores/${p.id}`)}
                      >
                        Ver Perfil
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {especialidades.length > pageSize && (
        <Paginacion
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default ReportePrestadoresPorEspecialidad;
