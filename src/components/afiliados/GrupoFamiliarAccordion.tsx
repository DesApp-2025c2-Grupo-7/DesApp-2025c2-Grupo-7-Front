import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Users, Eye, UserPlus } from "lucide-react";
import type { Afiliado, GrupoFamiliar } from "../../types/afiliados";
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
  const navigate = useNavigate();

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

  const isActiveAfiliado = (miembro: Afiliado) => {
    if (!miembro.fechaBaja) return true;
    const today = new Date().toISOString().split('T')[0];
    return miembro.fechaBaja > today;
  };

  const getEstadoText = (miembro: Afiliado) => {
    const today = new Date().toISOString().split('T')[0];
    if (miembro.fechaAlta && miembro.fechaAlta > today) {
      return `Activo a partir de ${miembro.fechaAlta}`;
    } 
    if (!miembro.fechaBaja) return 'Activo';
    if (miembro.fechaBaja > today) {
      return `Activo hasta ${miembro.fechaBaja}`;
    }
    return 'Inactivo';
  };


  // Debug temporal


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
            
            {miembrosGrupo.map((miembro, index) => {
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
          </div>
        </div>
      )}
    </div>
  );
};

export default GrupoFamiliarAccordion;