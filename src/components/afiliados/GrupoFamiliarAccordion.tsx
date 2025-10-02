import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Users, Eye } from "lucide-react";
import type { Afiliado, GrupoFamiliar } from "../../types/afiliados";
import "./GrupoFamiliarAccordion.css";

interface GrupoFamiliarAccordionProps {
  afiliadoActual: Afiliado;
  grupoFamiliar: GrupoFamiliar;
  miembrosGrupo: Afiliado[];
}

const GrupoFamiliarAccordion: React.FC<GrupoFamiliarAccordionProps> = ({
  afiliadoActual,
  grupoFamiliar,
  miembrosGrupo
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleVerMas = (afiliadoId: number) => {
    navigate(`/afiliados/${afiliadoId}`);
  };

  const isActiveAfiliado = (miembro: Afiliado) => {
    if (!miembro.fechaBaja) return true;
    const today = new Date().toISOString().split('T')[0];
    return miembro.fechaBaja > today;
  };

  const getEstadoText = (miembro: Afiliado) => {
    if (!miembro.fechaBaja) return 'Activo';
    const today = new Date().toISOString().split('T')[0];
    if (miembro.fechaBaja > today) {
      return `Activo hasta ${miembro.fechaBaja}`;
    }
    return 'Inactivo';
  };


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
                <span>{grupoFamiliar.fechaAltaPlan}</span>
              </div>
            </div>
          </div>

          {/* Lista de Miembros del Grupo */}
          <div className="miembros-grupo">
            <h5>Miembros del Grupo Familiar</h5>
            
            {miembrosGrupo.map((miembro) => (
              <div 
                key={miembro.id} 
                className={`miembro-card ${miembro.id === afiliadoActual.id ? 'miembro-actual' : ''}`}
              >
                <div className="miembro-header">
                  <div className="miembro-info">
                    <strong>{miembro.nombre} {miembro.apellido}</strong>
                    <span className="parentesco">{miembro.parentesco}</span>
                    {miembro.id === afiliadoActual.id && (
                      <span className="badge-actual">Actual</span>
                    )}
                  </div>
                  <span className="credencial">{miembro.credencial}</span>
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
                      {miembro.situacionesTerapeuticas.map((st, index) => (
                        <div key={index} className="situacion-item">
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

                {miembro.id !== afiliadoActual.id && (
                  <div className="miembro-actions">
                    <button 
                      className="btn-ver-mas"
                      onClick={() => handleVerMas(miembro.id)}
                    >
                      <Eye size={16} />
                      Ver más
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrupoFamiliarAccordion;