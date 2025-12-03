import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Users, Eye, UserPlus } from "lucide-react";
import type { Afiliado, GrupoFamiliar } from "../../types/afiliados";
import { esPersonaActiva, getTextoEstadoPersona } from "../../utils/estadoAfiliado";
import Input from "../genericos/Input";
import Paginacion from "../genericos/Paginacion";
import "./GrupoFamiliarAccordion.css";

interface GrupoFamiliarAccordionProps {
  afiliadoActual: Afiliado;
  grupoFamiliar: GrupoFamiliar;
  miembrosGrupo: Afiliado[];
  onAgregarIntegrante?: () => void;
}

const GrupoFamiliarAccordion: React.FC<GrupoFamiliarAccordionProps> = ({
  afiliadoActual,
  grupoFamiliar,
  miembrosGrupo,
  onAgregarIntegrante
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const navigate = useNavigate();

  const miembrosPorPagina = 3;

  // Función helper para determinar si es titular
  const esTitular = (persona: any) => {
    return (persona.tipoPersona === "AFILIADO") || (persona.parentesco === "Titular");
  };

  // Función helper para obtener el texto del parentesco
  const obtenerParentesco = (persona: any) => {
    return esTitular(persona) ? "Titular" : (persona.parentesco || "Integrante");
  };

  const handleVerMas = (miembro: any) => {
    // Si el miembro es el titular, navegar normalmente
    if (esTitular(miembro)) {
      navigate(`/afiliados/${miembro.id}`);
    } else {
      // Si es un integrante, navegar al titular con parámetro del integrante usando credencial-sufijo
      const integranteKey = `${miembro.credencial}-${miembro.sufijo}`;
      // Encontrar el titular en el grupo
      const titular = miembrosGrupo.find(m => esTitular(m));
      if (titular) {
        navigate(`/afiliados/${titular.id}?integrante=${integranteKey}`);
      }
    }
  };

  // Usar funciones utilitarias estandarizadas
  const isActiveAfiliado = (miembro: Afiliado) => esPersonaActiva(miembro);
  const getEstadoText = (miembro: Afiliado) => getTextoEstadoPersona(miembro);

  // Filtrar miembros según búsqueda
  const miembrosFiltrados = miembrosGrupo.filter((miembro) => {
    const filtro = busqueda.toLowerCase().trim();
    if (filtro === "") return true;

    return (
      miembro.nombre.toLowerCase().includes(filtro) ||
      miembro.apellido.toLowerCase().includes(filtro) ||
      miembro.numeroDocumento.includes(filtro) ||
      `${miembro.credencial}-${miembro.sufijo}`.includes(filtro)
    );
  });

  // Calcular paginación
  const totalPages = Math.ceil(miembrosFiltrados.length / miembrosPorPagina);
  const miembrosPaginados = miembrosFiltrados.slice(
    (paginaActual - 1) * miembrosPorPagina,
    paginaActual * miembrosPorPagina
  );

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  // Mostrar paginación solo si hay más de 3 miembros
  const mostrarPaginacion = miembrosGrupo.length > miembrosPorPagina;

  return (
    <div className="grupo-familiar-accordion">
      <div 
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="accordion-title">
          <Users size={20} />
          <h4>Grupo Familiar ({miembrosGrupo.length} miembros)</h4>
        </div>
        <div className="accordion-toggle">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isOpen && (
        <div className="accordion-content">
          {/* Información del Plan Familiar */}
          <div className="plan-familiar-info">
            <h5>Plan Médico Familiar</h5>
            <div className="form-row-double">
              <div className="form-row-double-item-left">
                <label>Plan</label>
                <span>{grupoFamiliar.planMedico}</span>
              </div>
              <div className="form-row-double-item-right">
                <label>Fecha Alta Plan</label>
                <span>{grupoFamiliar.fechaAlta}</span>
              </div>
            </div>
            
            {grupoFamiliar.estado && (
              <div className="form-row">
                <label>Estado del Grupo</label>
                <span className={`estado-grupo ${grupoFamiliar.estado.toLowerCase()}`}>
                  {grupoFamiliar.estado}
                </span>
              </div>
            )}
          </div>

          {/* Lista de Miembros del Grupo */}
          <div className="miembros-grupo">
            <div className="miembros-header">
              <h5>Miembros del Grupo Familiar</h5>
              {onAgregarIntegrante && (
                <button 
                  className="btn-agregar-integrante"
                  onClick={onAgregarIntegrante}
                  title="Agregar nuevo integrante al grupo familiar"
                >
                  <UserPlus size={16} />
                  Agregar Integrante
                </button>
              )}
            </div>

            {/* Buscador (solo mostrar si hay más de 3 miembros) */}
            {mostrarPaginacion && (
              <div className="busqueda-contenedor-input" style={{ marginBottom: "1rem" }}>
                <Input
                  type="text"
                  placeholder="Buscar por nombre, apellido, DNI o credencial"
                  value={busqueda}
                  onChange={(value) => {
                    setBusqueda(value);
                  }}
                  variant="search"
                />
              </div>
            )}
            
            {miembrosPaginados.map((miembro, index) => {
              const esAfililadoActual = miembro.credencial === afiliadoActual.credencial && miembro.sufijo === afiliadoActual.sufijo;
              
              return (
                <div 
                  key={`${miembro.credencial}-${miembro.sufijo}-${index}`} 
                  className={`miembro-card ${esAfililadoActual ? 'miembro-actual' : ''}`}
                >
                  <div className="miembro-header">
                    <div className="miembro-info">
                      <strong>{miembro.nombre} {miembro.apellido}</strong>
                      <span className="parentesco">
                        {obtenerParentesco(miembro)}
                      </span>
                      {esAfililadoActual && (
                        <span className="badge-actual">ACTUAL</span>
                      )}
                  </div>
                  <span className="credencial">{miembro.credencial}-{miembro.sufijo}</span>
                </div>
                
                <div className="miembro-detalles">
                  <div className="detalle-row">
                    <span className="label">DNI:</span>
                    <span>{miembro.numeroDocumento}</span>
                  </div>
                  <div className="detalle-row">
                    <span className="label">Fecha Nac:</span>
                    <span>{miembro.fechaNacimiento}</span>
                  </div>
                  <div className="detalle-row">
                    <span className="label">Fecha Alta:</span>
                    <span>{miembro.fechaAlta}</span>
                  </div>
                  {miembro.fechaBaja && (
                    <div className="detalle-row">
                      <span className="label">Fecha Baja:</span>
                      <span className="fecha-baja">{miembro.fechaBaja}</span>
                    </div>
                  )}
                  <div className="detalle-row">
                    <span className="label">Estado:</span>
                    <span className={`estado ${isActiveAfiliado(miembro) ? 'activo' : 'inactivo'}`}>
                      {getEstadoText(miembro)}
                    </span>
                  </div>
                  {miembro.telefono.length > 0 && (
                    <div className="detalle-row">
                      <span className="label">Teléfono:</span>
                      <span>{miembro.telefono[0]}</span>
                    </div>
                  )}
                  
                  {miembro.situacionesTerapeuticas && miembro.situacionesTerapeuticas.length > 0 && (
                    <div className="situaciones-terapeuticas">
                      <div className="situaciones-header">
                        <span className="label">Situaciones Terapéuticas:</span>
                      </div>
                      {miembro.situacionesTerapeuticas.map((st: any, index: number) => (
                        <div key={`${miembro.credencial}-${miembro.sufijo}-st-${index}`} className="situacion-item">
                          <div className="situacion-diagnostico">
                            <strong>{st.diagnostico}</strong>
                          </div>
                          <div className="situacion-fechas">
                            <span className="fecha-inicio">
                              Inicio: {st.fechaInicio}
                            </span>
                            {st.fechaFin && (
                              <span className="fecha-fin">
                                Fin: {st.fechaFin}
                              </span>
                            )}
                            {!st.fechaFin && (
                              <span className="activa">Activa</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!esAfililadoActual && (
                  <div className="miembro-actions">
                    <button 
                      className="btn-ver-mas"
                      onClick={() => handleVerMas(miembro)}
                    >
                      <Eye size={16} />
                      Ver más
                    </button>
                  </div>
                )}
              </div>
              );
            })}

            {/* Paginación (solo mostrar si hay más de 3 miembros) */}
            {mostrarPaginacion && totalPages > 1 && (
              <div style={{ marginTop: "1rem" }}>
                <Paginacion
                  totalPages={totalPages}
                  currentPage={paginaActual}
                  onPageChange={setPaginaActual}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrupoFamiliarAccordion;