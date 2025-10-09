import React, { useState } from "react";
import Button from "../genericos/Button";
import ModalConfirmacion from "../genericos/ModalConfirmacion";
import GrupoFamiliarAccordion from "./GrupoFamiliarAccordion";
import { AlertTriangle, UserX } from "lucide-react";
import "./ListaAfiliados.css"
import type { Afiliado, GrupoFamiliar } from "../../types/afiliados";

interface AfiliadoFormProps {
  afiliado: Afiliado | null;
  afiliadoTitular?: Afiliado | null; // Titular original para referencia del grupo
  grupoFamiliar: GrupoFamiliar | null;
  miembrosGrupo: Afiliado[];
  onDarDeBaja: () => void;  
}

const AfiliadosForm: React.FC<AfiliadoFormProps> = ( {afiliado, afiliadoTitular, grupoFamiliar, miembrosGrupo, onDarDeBaja}  ) => {
    const [mostrarModalBaja, setMostrarModalBaja] = useState(false);

    const isActive = () => {
        if (!afiliado?.fechaBaja) return true;
        const today = new Date().toISOString().split('T')[0];
        return afiliado.fechaBaja > today;
    };

    const esTitular = () => {
        // Si tiene parentesco definido, usar eso
        if (afiliado?.parentesco) {
            return afiliado.parentesco === "Titular";
        }
        
        // Si no tiene parentesco, verificar si es el primer elemento (titular) en miembrosGrupo
        if (miembrosGrupo && miembrosGrupo.length > 0) {
            const titular = miembrosGrupo.find(m => m.parentesco === "Titular");
            return titular ? titular.id === afiliado?.id : false;
        }
        
        // Fallback: si no hay grupo familiar, asumir que es titular
        return true;
    };

    const handleAbrirModalBaja = () => {
        setMostrarModalBaja(true);
    };

    const handleCerrarModal = () => {
        setMostrarModalBaja(false);
    };

    const handleConfirmarBaja = () => {
        setMostrarModalBaja(false);
        onDarDeBaja();
    };

    const getModalContent = () => {
        const titular = esTitular();
        const cantidadIntegrantes = miembrosGrupo ? miembrosGrupo.length - 1 : 0; // -1 para excluir al titular
        
        if (titular && cantidadIntegrantes > 0) {
            return {
                titulo: "Dar de baja Afiliado",
                mensaje: `¿Está seguro que desea dar de baja a ${afiliado?.nombre} ${afiliado?.apellido}?`,
                submensaje: `Al ser el titular del grupo familiar, esta acción dará de baja automáticamente a todos los integrantes del grupo familiar. Esta acción no se puede deshacer.`,
                icono: <AlertTriangle size={24} />,
                tipoOperacion: 'danger' as const
            };
        } else if (titular && cantidadIntegrantes === 0) {
            return {
                titulo: "Dar de baja Afiliado",
                mensaje: `¿Está seguro que desea dar de baja a ${afiliado?.nombre} ${afiliado?.apellido}?`,
                submensaje: "Esta acción marcará al afiliado como inactivo en el sistema. Esta acción no se puede deshacer.",
                icono: <UserX size={24} />,
                tipoOperacion: 'warning' as const
            };
        } else {
            return {
                titulo: "Dar de baja al Integrante",
                mensaje: `¿Estás seguro que deseas dar de baja a ${afiliado?.nombre} ${afiliado?.apellido}?`,
                submensaje: "Esta acción dará de baja únicamente a este integrante del grupo familiar. El titular y otros integrantes permanecerán activos.",
                icono: <UserX size={24} />,
                tipoOperacion: 'warning' as const
            };
        }
    };

    const getEstadoText = () => {
        if (!afiliado?.fechaBaja) return 'Activo';
        const today = new Date().toISOString().split('T')[0];
        if (afiliado.fechaBaja > today) {
            return `Activo hasta ${afiliado.fechaBaja}`;
        }
        return 'Inactivo';
    };

    return (
        <>
          <div className="afiliado-header">
            <div className="afiliado-info">
              <h2>{afiliado?.nombre} {afiliado?.apellido}</h2>
              <span className={`estado-badge ${isActive() ? 'activo' : 'inactivo'}`}>
                {getEstadoText()}
              </span>
            </div>
          </div>

          <div className="afiliado-form">
            <div className="form-row"><label>Credencial</label><span>{afiliado?.credencial}-{afiliado?.sufijo}</span></div> 
          <div className="form-row"><label>Parentesco</label><span>{afiliado?.parentesco}</span></div>
          <div className="form-row"><label>Nombre</label><span>{afiliado?.nombre}</span></div>
          <div className="form-row"><label>Apellido</label><span>{afiliado?.apellido}</span></div>

          <div className="form-row-double">
            <div className="form-row-double-item-left"> 
              <label>Tipo de documento</label><span>{afiliado?.tipoDocumento}</span>
            </div>
            <div className="form-row-double-item-right">
              <label>Número de documento</label><span>{afiliado?.numeroDocumento}</span>
            </div>
          </div>
          <div className="form-row">
            <label>Fecha de nacimiento</label>
            <span>{afiliado?.fechaNacimiento}</span>
          </div>

          <div className="form-row">
            <label>Dirección</label>
            {afiliado?.direccion.map((d, index) => <span key={index}>{`${d.calle} ${d.numero}${d.depto ? `, ${d.depto}`: ""}, ${d.codigoPostal}, ${d.localidad}`}</span>)}
          </div>
          <div className="form-row">
            <label>Teléfono</label>
            {afiliado?.telefono.map((tel, index) => <span key={index}>{tel}</span> )}
          </div>

          <div className="form-row">
            <label>Email</label>
            {afiliado?.email.map((e, index) => <span key={index}>{`${e}`}</span>)}
          </div>
          <div className="form-row"></div>
          <div className="form-row">
            <h4>Situaciones Terapeuticas</h4>
            

              {afiliado && afiliado.situacionesTerapeuticas && afiliado.situacionesTerapeuticas.length > 0
                ? afiliado.situacionesTerapeuticas.map((st, index) => st.fechaFin === null ?
                  <div key={index}>
                  <div className="form-row-double">
                    <div className="form-row-double-item-left">
                    <label>Diagnóstico</label> <span>{st.diagnostico} </span>
                  </div>
                  <div className="form-row-double-item-right">
                    <label>Fecha de inicio</label> <span>{st.fechaInicio} </span>
                  </div>
                  </div>
                 
                  </div> : 
                  <div key={index}>
                    <label>Diagnóstico</label> <span>{st.diagnostico} </span>
                  <div className="form-row-double">

                    <div className="form-row-double-item-left">
                      <label>Fecha de inicio</label> <span>{st.fechaInicio} </span>
                    </div>
                    <div className="form-row-double-item-right">
                      <label>Fecha de fin</label> <span>{st.fechaFin} </span>
                    </div>
                  </div>
                  </div>
              )
                : <div className="form-row-double-item-right"> 
                    <label>Diagnóstico</label>
                    <span>No posee situaciones terapeuticas</span>
                  </div>}
          </div>

          <div className="form-row">
            <h4>Ingreso/Egreso al Sistema</h4>
            <div className="form-row-double">
              <div className="form-row-double-item-left">
                <label>Fecha de Alta</label><span>{afiliado?.fechaAlta}</span>
              </div>
              <div className="form-row-double-item-right">
                <label>Fecha Baja</label><span>{afiliado?.fechaBaja}</span>
              </div>
            </div>
        
          </div>

          {afiliado && grupoFamiliar && miembrosGrupo.length > 0 && (
            <GrupoFamiliarAccordion
              afiliadoActual={afiliado}
              grupoFamiliar={grupoFamiliar}
              miembrosGrupo={miembrosGrupo}
            />
          )}
          <div className="form-row"></div>

            <Button size="large" variant="danger" type="button" onClick={handleAbrirModalBaja}>
                Dar de baja
            </Button>
          </div>

          {/* Modal de confirmación para dar de baja */}
          <ModalConfirmacion
            isOpen={mostrarModalBaja}
            onClose={handleCerrarModal}
            onConfirm={handleConfirmarBaja}
            titulo={getModalContent().titulo}
            mensaje={getModalContent().mensaje}
            submensaje={getModalContent().submensaje}
            tipoOperacion={getModalContent().tipoOperacion}
            icono={getModalContent().icono}
            textoBotonConfirmar="Sí, dar de baja"
            textoBotonCancelar="Cancelar"
          />
        </>
    );
};

export default AfiliadosForm;