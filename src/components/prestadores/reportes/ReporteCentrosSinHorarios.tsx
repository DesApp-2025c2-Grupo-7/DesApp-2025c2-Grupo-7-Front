import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileDown, FileSpreadsheet } from "lucide-react";
import "./ReporteCentrosSinHorarios.css";
import { getApiUrl } from "../../../config/env";

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
  const [mostrarPopup, setMostrarPopup] = useState(false);
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

  const handleDescargar = (formato: "pdf" | "excel") => {
    setMostrarPopup(true);
    setTimeout(() => setMostrarPopup(false), 3000);
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
            onClick={() => handleDescargar("pdf")}
            disabled={centrosSinHorarios.length === 0}
          >
            <FileDown size={18} />
            Descargar PDF
          </button>
          <button
            className="btn-export"
            onClick={() => handleDescargar("excel")}
            disabled={centrosSinHorarios.length === 0}
          >
            <FileSpreadsheet size={18} />
            Descargar Excel
          </button>
        </div>

        {mostrarPopup && (
          <div className="popup-descarga">
            <p>Funcionalidad de descarga próximamente disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteCentrosSinHorarios;
