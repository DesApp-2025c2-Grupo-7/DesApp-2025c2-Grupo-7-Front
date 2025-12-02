import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileDown, FileSpreadsheet } from "lucide-react";
import "./ReporteCentrosSinHorarios.css";
import { getApiUrl } from "../../../config/env";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Prestador {
  id: number;
  nombreCompleto: string;
  numeroCUIL: string;
  especialidades: { nombre: string }[];
  direccion: {
    calle: string;
    numero: string;
    localidad: string;
    horariosAtencion: any[];
  }[];
  esProfesionalIndependiente: boolean;
  fechaAlta: string;
  fechaBaja?: string;
}

interface ReporteCentrosSinHorariosProps {
  onClose: () => void;
}

const ReporteCentrosSinHorarios: React.FC<ReporteCentrosSinHorariosProps> = ({ onClose }) => {
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);
  const [centrosSinHorarios, setCentrosSinHorarios] = useState<Prestador[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrestadores = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl("/prestadores"));
        if (!response.ok) {
          throw new Error("Error al obtener los prestadores");
        }
        const data: Prestador[] = await response.json();
        setPrestadores(data);

        // Filtrar solo centros (no profesionales independientes) sin horarios
        const centrosFiltrados = data.filter((p) => {
          // Solo centros médicos
          if (p.esProfesionalIndependiente) return false;
          
          // Solo activos (sin fecha de baja o fecha de baja futura)
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          if (p.fechaBaja) {
            const fechaBaja = new Date(p.fechaBaja);
            fechaBaja.setHours(0, 0, 0, 0);
            if (fechaBaja <= hoy) return false;
          }

          // Sin horarios de atención
          const tieneHorarios = p.direccion?.some(
            (d) => d.horariosAtencion && d.horariosAtencion.length > 0
          );
          return !tieneHorarios;
        });

        setCentrosSinHorarios(centrosFiltrados);
      } catch (error) {
        console.error("Error al cargar prestadores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestadores();
  }, []);

  const descargarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text('Reporte de Centros sin Agendas de Turnos', 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 22);
    doc.text(`Total de centros sin horarios: ${centrosSinHorarios.length}`, 14, 27);
    doc.text('Centros médicos activos sin horarios de atención configurados', 14, 32);

    // Preparar datos para la tabla
    const datos = centrosSinHorarios.map(centro => {
      const especialidades = centro.especialidades?.map(e => e.nombre).join(', ') || 'Sin especialidad';
      const direcciones = centro.direccion?.map(d => 
        `${d.calle || ''} ${d.numero || ''}, ${d.localidad || ''}`.trim()
      ).join(' | ') || 'Sin dirección';

      return [
        centro.nombreCompleto,
        centro.numeroCUIL,
        especialidades,
        direcciones,
        new Date(centro.fechaAlta).toLocaleDateString('es-AR')
      ];
    });

    autoTable(doc, {
      startY: 38,
      head: [['Nombre del Centro', 'CUIL', 'Especialidades', 'Dirección', 'Fecha Alta']],
      body: datos,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [75, 129, 216] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 50 },
        4: { cellWidth: 25 }
      }
    });

    doc.save(`centros_sin_horarios_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const descargarExcel = () => {
    const datosExcel = centrosSinHorarios.map(centro => ({
      'Nombre del Centro': centro.nombreCompleto,
      'CUIL': centro.numeroCUIL,
      'Especialidades': centro.especialidades?.map(e => e.nombre).join(', ') || 'Sin especialidad',
      'Direcciones': centro.direccion?.map(d => 
        `${d.calle || ''} ${d.numero || ''}, ${d.localidad || ''}`.trim()
      ).join(' | ') || 'Sin dirección',
      'Fecha de Alta': new Date(centro.fechaAlta).toLocaleDateString('es-AR'),
      'Estado': 'Activo',
      'Observación': 'Sin horarios de atención configurados'
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Centros sin Horarios');

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 35 }, // Nombre
      { wch: 15 }, // CUIL
      { wch: 30 }, // Especialidades
      { wch: 50 }, // Direcciones
      { wch: 15 }, // Fecha Alta
      { wch: 10 }, // Estado
      { wch: 40 }  // Observación
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `centros_sin_horarios_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleVerMas = (prestadorId: number) => {
    onClose();
    navigate(`/prestadores/${prestadorId}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-reporte" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Reporte de Centros sin Agendas de turnos</h2>
            <p className="modal-subtitle">
              Listado de centros médicos activos que no tienen ningún horario de atención configurados
            </p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-message">Cargando centros...</div>
          ) : centrosSinHorarios.length === 0 ? (
            <div className="empty-message">
              <p>✓ Todos los centros médicos activos tienen horarios configurados</p>
            </div>
          ) : (
            <>
              <div className="reporte-info">
                <strong>Total de centros sin horarios:</strong> {centrosSinHorarios.length}
              </div>
              <div className="lista-centros">
                {centrosSinHorarios.map((centro) => (
                  <div key={centro.id} className="centro-item">
                    <div className="centro-principal">
                      <h3 className="centro-nombre">{centro.nombreCompleto}</h3>
                      <div className="centro-detalles">
                        <span>
                          <strong>CUIL:</strong> {centro.numeroCUIL}
                        </span>
                        {centro.especialidades && centro.especialidades.length > 0 && (
                          <span>
                            <strong>Especialidades:</strong>{" "}
                            {centro.especialidades.map((e) => e.nombre).join(", ")}
                          </span>
                        )}
                        {centro.direccion && centro.direccion.length > 0 && (
                          <span>
                            <strong>Dirección:</strong>{" "}
                            {centro.direccion
                              .map(
                                (d) =>
                                  `${d.calle || ""} ${d.numero || ""}, ${d.localidad || ""}`.trim()
                              )
                              .join(" | ")}
                          </span>
                        )}
                        <span>
                          <strong>Fecha de alta:</strong>{" "}
                          {new Date(centro.fechaAlta).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-ver-mas"
                      onClick={() => handleVerMas(centro.id)}
                    >
                      Ver más
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-export"
            onClick={descargarPDF}
            disabled={centrosSinHorarios.length === 0}
          >
            <FileDown size={18} />
            Descargar PDF
          </button>
          <button
            className="btn-export"
            onClick={descargarExcel}
            disabled={centrosSinHorarios.length === 0}
          >
            <FileSpreadsheet size={18} />
            Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReporteCentrosSinHorarios;
