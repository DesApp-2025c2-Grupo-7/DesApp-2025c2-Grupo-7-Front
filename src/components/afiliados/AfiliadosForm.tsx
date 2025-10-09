import React from "react";
import Button from "../genericos/Button";
import GrupoFamiliarAccordion from "./GrupoFamiliarAccordion";
import "./ListaAfiliados.css";
import type { Afiliado, GrupoFamiliar } from "../../types/afiliados";

interface AfiliadoFormProps {
  afiliado: Afiliado | null;
  grupoFamiliar: GrupoFamiliar | null;
  miembrosGrupo: Afiliado[];
  onDarDeBaja: () => void;
}

const AfiliadosForm: React.FC<AfiliadoFormProps> = ({
  afiliado,
  grupoFamiliar,
  miembrosGrupo,
  onDarDeBaja,
}) => {
  const isActive = () => {
    if (!afiliado?.fechaBaja) return true;
    const today = new Date().toISOString().split("T")[0];
    return afiliado.fechaBaja > today;
  };

  const getEstadoText = () => {
    if (!afiliado?.fechaBaja) return "Activo";
    const today = new Date().toISOString().split("T")[0];
    if (afiliado.fechaBaja > today) {
      return `Activo hasta ${afiliado.fechaBaja}`;
    }
    return "Inactivo";
  };

  return (
    <>
      <div className="afiliado-header">
        <div className="afiliado-info">
          <h2>
            {afiliado?.nombre} {afiliado?.apellido}
          </h2>
          <span
            className={`estado-badge ${isActive() ? "activo" : "inactivo"}`}
          >
            {getEstadoText()}
          </span>
        </div>
      </div>

      <div className="afiliado-form">
        <div className="form-row">
          <label>Credencial</label>
          <span>{afiliado?.credencial}</span>
        </div>
        <div className="form-row">
          <label>Parentesco</label>
          <span>{afiliado?.parentesco}</span>
        </div>
        <div className="form-row">
          <label>Nombre</label>
          <span>{afiliado?.nombre}</span>
        </div>
        <div className="form-row">
          <label>Apellido</label>
          <span>{afiliado?.apellido}</span>
        </div>

        <div className="form-row-double">
          <div className="form-row-double-item-left">
            <label>Tipo de documento</label>
            <span>{afiliado?.tipoDocumento}</span>
          </div>
          <div className="form-row-double-item-right">
            <label>Número de documento</label>
            <span>{afiliado?.numeroDocumento}</span>
          </div>
        </div>
        <div className="form-row">
          <label>Fecha de nacimiento</label>
          <span>{afiliado?.fechaNacimiento}</span>
        </div>

        <div className="form-row">
          <label>Dirección</label>
          {afiliado?.direccion.map((d) => (
            <span>{`${d.calle} ${d.numero}${d.depto ? `, ${d.depto}` : ""}, ${
              d.codigoPostal
            }, ${d.localidad}`}</span>
          ))}
        </div>
        <div className="form-row">
          <label>Teléfono</label>
          {afiliado?.telefono.map((tel) => (
            <span>{tel}</span>
          ))}
        </div>

        <div className="form-row">
          <label>Email</label>
          {afiliado?.email.map((e) => (
            <span>{`${e}`}</span>
          ))}
        </div>
        <div className="form-row"></div>
        <div className="form-row">
          <h4>Situaciones Terapeuticas</h4>

          {afiliado &&
          afiliado.situacionesTerapeuticas &&
          afiliado.situacionesTerapeuticas.length > 0 ? (
            afiliado.situacionesTerapeuticas.map((st) =>
              st.fechaFin === null ? (
                <>
                  <div className="form-row-double">
                    <div className="form-row-double-item-left">
                      <label>Diagnóstico</label> <span>{st.diagnostico} </span>
                    </div>
                    <div className="form-row-double-item-right">
                      <label>Fecha de inicio</label>{" "}
                      <span>{st.fechaInicio} </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <label>Diagnóstico</label> <span>{st.diagnostico} </span>
                  <div className="form-row-double">
                    <div className="form-row-double-item-left">
                      <label>Fecha de inicio</label>{" "}
                      <span>{st.fechaInicio} </span>
                    </div>
                    <div className="form-row-double-item-right">
                      <label>Fecha de fin</label> <span>{st.fechaFin} </span>
                    </div>
                  </div>
                </>
              )
            )
          ) : (
            <div className="form-row-double-item-right">
              <label>Diagnóstico</label>
              <span>No posee situaciones terapeuticas</span>
            </div>
          )}
        </div>

        <div className="form-row">
          <h4>Ingreso/Egreso al Sistema</h4>
          <div className="form-row-double">
            <div className="form-row-double-item-left">
              <label>Fecha de Alta</label>
              <span>{afiliado?.fechaAlta}</span>
            </div>
            <div className="form-row-double-item-right">
              <label>Fecha Baja</label>
              <span>{afiliado?.fechaBaja}</span>
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

        <Button
          size="large"
          variant="danger"
          type="button"
          onClick={onDarDeBaja}
        >
          Dar de baja
        </Button>
      </div>
    </>
  );
};

export default AfiliadosForm;