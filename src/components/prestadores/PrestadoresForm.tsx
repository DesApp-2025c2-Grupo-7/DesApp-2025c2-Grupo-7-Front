// PrestadoresForm.tsx
import React from "react";
import "./ListaPrestadores.css";
("../components/genericos/Button");
import type { Prestador } from "../../types/prestadores";
import CardDireccionesYHorariosForm from "./CardDireccionesYHorariosForm";

interface PrestadoresFormProps {
  prestador: Prestador | null;
}

const PrestadoresForm: React.FC<PrestadoresFormProps> = ({ prestador }) => {
  if (!prestador) return <p>No se encontró el prestador</p>;

  return (
    <>
      {prestador ? (
        <div className="prestador-form">
          {/* Tipo de prestador */}
          <div className="form-row">
            <label>Tipo de prestador</label>
            <span>{prestador.tipoPrestacion}</span>
          </div>

          {/* Especialidades */}
          <div className="form-row">
            <label>Especialidades</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.2rem 0.2rem",
                color: "#646b72ff",
              }}
            >
              {prestador.especialidades?.map((esp, i) => (
                <span key={i}>{esp}</span>
              ))}
            </div>
          </div>

          {/* Datos principales */}
          <div className="form-row">
            <label>Nro de CUIL o CUIT</label>
            <span>{prestador.numeroCUIL}</span>
          </div>
          <div className="form-row">
            <label>Nombre completo</label>
            <span>{prestador.nombreCompleto}</span>
          </div>
          <div className="form-row">
            <label>Teléfono</label>
            {prestador?.telefono.map((tel) => (
              <span>{tel}</span>
            ))}
          </div>

          <div className="form-row">
            <label>Email</label>
            {prestador?.email.map((email) => (
              <span>{email}</span>
            ))}
          </div>
          {/* Fecha de baja */}
          <div className="form-row">
            <label>Fecha de baja</label>
            <span>{(prestador as any).fechaBaja || "Activo"}</span>
          </div>

          <CardDireccionesYHorariosForm direcciones={prestador.direccion} />
        </div>
      ) : (
        <p>No se encontró el prestador</p>
      )}
    </>
  );
};

export default PrestadoresForm;
