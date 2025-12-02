import React, { useState } from "react";
import { UserX, AlertTriangle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../genericos/Button";
import ModalConfirmacion from "../genericos/ModalConfirmacion";
import Modal from "../genericos/Modal";
import { useModal } from "../../hooks/useModal";
import type { Prestador } from "../../types/prestadores";
import { getApiUrl } from "../../config/env";
import "./ListaPrestadores.css";

type ListaPrestadoresProps = {
  prestadores: Prestador[];
};

const ListaPrestadores: React.FC<ListaPrestadoresProps> = ({ prestadores }) => {
  const navigate = useNavigate();
  const modal = useModal();
  const [modalBajaOpen, setModalBajaOpen] = useState(false);
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState<Prestador | null>(null);
  const [tipoBaja, setTipoBaja] = useState<"inmediata" | "diferida">("inmediata");
  const [fechaBajaSeleccionada, setFechaBajaSeleccionada] = useState(new Date().toISOString().split("T")[0]);

  // Verificar si el prestador está activo
  const estaActivo = (prestador: Prestador): boolean => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (prestador.fechaBaja) {
      const fechaBaja = new Date(prestador.fechaBaja);
      fechaBaja.setHours(0, 0, 0, 0);
      if (fechaBaja <= hoy) return false;
    }

    if (prestador.fechaAlta) {
      const fechaAlta = new Date(prestador.fechaAlta);
      fechaAlta.setHours(0, 0, 0, 0);
      if (fechaAlta > hoy) return false;
    }

    return true;
  };

  // Verificar si tiene baja programada (fecha futura)
  const tieneBajaProgramada = (prestador: Prestador): boolean => {
    if (!prestador.fechaBaja) return false;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaBaja = new Date(prestador.fechaBaja);
    fechaBaja.setHours(0, 0, 0, 0);
    
    return fechaBaja > hoy;
  };

  // Navegar al perfil
  const handleVerMas = (id: number) => {
    navigate(`/prestadores/${id}`);
  };

  // Abrir modal de dar de baja
  const handleAbrirModalBaja = (prestador: Prestador) => {
    setPrestadorSeleccionado(prestador);
    setTipoBaja("inmediata");
    setFechaBajaSeleccionada(new Date().toISOString().split("T")[0]);
    setModalBajaOpen(true);
  };

  // Confirmar baja
  const handleConfirmarBaja = async () => {
    if (!prestadorSeleccionado) return;

    const fechaFinal = tipoBaja === "inmediata" 
      ? new Date().toISOString().split("T")[0]
      : fechaBajaSeleccionada;

    if (tipoBaja === "diferida" && !fechaBajaSeleccionada) {
      modal.mostrarError(
        "Fecha de baja requerida",
        "Debe seleccionar una fecha de baja válida",
        ["Por favor, seleccione una fecha para dar de baja al prestador"]
      );
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/prestadores/${prestadorSeleccionado.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...prestadorSeleccionado,
          fechaBaja: fechaFinal,
          especialidadIds: prestadorSeleccionado.especialidades.map(e => e.id)
        })
      });

      if (!res.ok) throw new Error("No se pudo dar de baja el prestador");

      setModalBajaOpen(false);
      
      modal.mostrarModal({
        titulo: "¡Prestador dado de baja!",
        mensaje: `Se ha dado de baja a ${prestadorSeleccionado.nombreCompleto} correctamente.`,
        submensaje: tipoBaja === "diferida" 
          ? `El prestador estará inactivo desde el ${new Date(fechaFinal).toLocaleDateString()}`
          : "El prestador ha sido dado de baja inmediatamente",
        tipo: "success",
        textoBotonConfirmar: "Aceptar",
        soloInformacion: true,
        onConfirmar: () => {
          window.location.reload();
        }
      });
    } catch (err: any) {
      console.error(err);
      modal.mostrarError(
        "Error al dar de baja",
        "No se pudo dar de baja el prestador",
        [err.message || "Error desconocido"]
      );
    }
  };

  if (prestadores.length === 0) return <p>No se encontraron prestadores</p>;

  return (
    <>
      <div className="prestadores-cards">
        <h3>Resultados</h3>
        <div className="cards-grid">
          {prestadores.map((prestador) => {
            const activo = estaActivo(prestador);
            const bajaProgramada = tieneBajaProgramada(prestador);

            return (
              <div 
                key={prestador.id} 
                className={`prestador-card ${
                  prestador.esProfesionalIndependiente 
                    ? 'profesional-independiente' 
                    : 'centro-medico'
                } ${!activo ? 'prestador-inactivo' : ''} ${bajaProgramada ? 'baja-programada' : ''}`}
              >
                <span className={`prestador-tipo-badge ${
                  prestador.esProfesionalIndependiente ? 'profesional' : 'centro'
                }`}>
                  {prestador.esProfesionalIndependiente ? 'Profesional' : 'Centro Médico'}
                </span>

                {!activo && (
                  <span className="badge-inactivo">
                    {prestador.fechaBaja ? "Dado de baja" : "Pendiente de alta"}
                  </span>
                )}

                {bajaProgramada && prestador.fechaBaja && (
                  <span className="badge-baja-programada">
                    <Calendar size={14} />
                    Baja programada: {new Date(prestador.fechaBaja).toLocaleDateString()}
                  </span>
                )}

                <div className="card-header">
                  <h4 className="prestador-nombre">{prestador.nombreCompleto}</h4>

                  {/* ⭐ ESPECIALIDADES LIMITADAS ⭐ */}
                  <div className="prestador-especialidades-list">
                    {prestador.especialidades.length > 0 ? (
                      <>
                        {prestador.especialidades.slice(0, 5).map((especialidad) => (
                          <span key={especialidad.id} className="prestador-especialidad">
                            {especialidad.nombre}
                          </span>
                        ))}

                        {prestador.especialidades.length > 5 && (
                          <span className="prestador-especialidad chip-extra">
                            +{prestador.especialidades.length - 5} más
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: "#666", fontSize: "0.9rem" }}>
                        No posee especialidades
                      </span>
                    )}
                  </div>
                </div>

                {/* Información adicional del prestador */}
                <div className="prestador-info-extra">
                  {/* Contacto */}
                  {(prestador.telefono?.length > 0 || prestador.email?.length > 0) && (
                    <div className="info-item">
                      <span className="info-label">📞 Contacto:</span>
                      <span className="info-value">
                        {prestador.telefono?.[0] && <span>{prestador.telefono[0]}</span>}
                        {prestador.telefono?.[0] && prestador.email?.[0] && " • "}
                        {prestador.email?.[0] && <span>{prestador.email[0]}</span>}
                      </span>
                    </div>
                  )}

                  {/* Para profesionales independientes: Centro médico asociado */}
                  {prestador.esProfesionalIndependiente && prestador.centrosMedicos && prestador.centrosMedicos.length > 0 && (
                    <div className="info-item">
                      <span className="info-label">🏥 Centro:</span>
                      <span className="info-value">{prestador.centrosMedicos[0].nombreCompleto}</span>
                    </div>
                  )}

                  {/* Horarios */}
                  {prestador.direccion && prestador.direccion.some(d => d.horariosAtencion?.length > 0) && (
                    <div className="info-item">
                      <span className="info-label">🕐 Horarios:</span>
                      <div className="info-value horarios-lista">
                        {(() => {
                          const ordenDias: Record<string, number> = {
                            'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4,
                            'Viernes': 5, 'Sábado': 6, 'Domingo': 7
                          };

                          const diasAbrev: Record<string, string> = {
                            'Lunes': 'Lun', 'Martes': 'Mar', 'Miércoles': 'Mié', 'Jueves': 'Jue',
                            'Viernes': 'Vie', 'Sábado': 'Sáb', 'Domingo': 'Dom'
                          };

                          const horariosPorDia = new Map<string, { desde: string, hasta: string }[]>();
                          
                          prestador.direccion.forEach(dir => {
                            dir.horariosAtencion?.forEach(horario => {
                              if (!horariosPorDia.has(horario.dia)) {
                                horariosPorDia.set(horario.dia, []);
                              }
                              horariosPorDia.get(horario.dia)?.push({
                                desde: horario.desde,
                                hasta: horario.hasta
                              });
                            });
                          });

                          const rangosPorDia = Array.from(horariosPorDia.entries()).map(([dia, horarios]) => {
                            const horasDesde = horarios.map(h => h.desde).sort();
                            const horasHasta = horarios.map(h => h.hasta).sort();
                            return {
                              dia,
                              desde: horasDesde[0],
                              hasta: horasHasta[horasHasta.length - 1]
                            };
                          });

                          rangosPorDia.sort((a, b) => ordenDias[a.dia] - ordenDias[b.dia]);

                          const horariosAgrupados: { dias: string[], rango: string }[] = [];

                          rangosPorDia.forEach(item => {
                            const rango = `${item.desde} - ${item.hasta}`;
                            const ultimoGrupo = horariosAgrupados[horariosAgrupados.length - 1];
                            
                            if (ultimoGrupo && ultimoGrupo.rango === rango) {
                              ultimoGrupo.dias.push(item.dia);
                            } else {
                              horariosAgrupados.push({ dias: [item.dia], rango });
                            }
                          });

                          return horariosAgrupados.slice(0, 2).map((grupo, idx) => (
                            <span key={idx} className="horario-grupo">
                              {grupo.dias.map(d => diasAbrev[d]).join(' y ')} de {grupo.rango}
                            </span>
                          ));
                        })()}

                        {prestador.direccion.reduce((total, dir) => 
                          total + (dir.horariosAtencion?.length || 0), 0
                        ) > 2 && (
                          <span className="horarios-extra">+más horarios</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {prestador.fechaBaja && !activo && (
                  <div className="prestador-info">
                    <p>
                      <strong>Fecha de baja:</strong>{" "}
                      {new Date(prestador.fechaBaja).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="card-actions">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleVerMas(prestador.id)}
                  >
                    Ver más
                  </Button>
                  {activo && (
                    <Button
                      variant="danger"
                      size="small"
                      icon={UserX}
                      iconPosition="left"
                      onClick={() => handleAbrirModalBaja(prestador)}
                    >
                      Dar de baja
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de confirmación de baja */}
      <ModalConfirmacion
        isOpen={modalBajaOpen}
        onClose={() => setModalBajaOpen(false)}
        onConfirm={handleConfirmarBaja}
        titulo="Dar de baja prestador"
        mensaje={`¿Está seguro que desea dar de baja a ${prestadorSeleccionado?.nombreCompleto}?`}
        submensaje={
          <div style={{ marginTop: "1rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <input
                  type="radio"
                  value="inmediata"
                  checked={tipoBaja === "inmediata"}
                  onChange={() => {
                    setTipoBaja("inmediata");
                    setFechaBajaSeleccionada(new Date().toISOString().split("T")[0]);
                  }}
                />
                Baja inmediata (hoy)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="radio"
                  value="diferida"
                  checked={tipoBaja === "diferida"}
                  onChange={() => setTipoBaja("diferida")}
                />
                Baja diferida
              </label>
            </div>
            {tipoBaja === "diferida" && (
              <input
                type="date"
                value={fechaBajaSeleccionada}
                onChange={(e) => setFechaBajaSeleccionada(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px"
                }}
              />
            )}
          </div>
        }
        tipoOperacion="danger"
        icono={<AlertTriangle size={24} />}
        textoBotonConfirmar="Confirmar baja"
        textoBotonCancelar="Cancelar"
      />

      {/* Modal universal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.cerrarModal}
        onConfirm={modal.confirmarModal}
        titulo={modal.config?.titulo || ""}
        mensaje={modal.config?.mensaje || ""}
        submensaje={modal.config?.submensaje}
        tipo={modal.config?.tipo || "info"}
        textoBotonConfirmar={modal.config?.textoBotonConfirmar}
        textoBotonCancelar={modal.config?.textoBotonCancelar}
        icono={modal.config?.icono}
        contenidoExtra={modal.config?.contenidoExtra}
        soloInformacion={modal.config?.soloInformacion}
        listaErrores={modal.config?.listaErrores}
      />
    </>
  );
};

export default ListaPrestadores;
