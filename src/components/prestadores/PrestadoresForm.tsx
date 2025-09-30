// PrestadoresForm.tsx
import React from "react";
import "./ListaPrestadores.css";
import type { Prestador } from "../../types/prestadores";

interface PrestadoresFormProps {
  prestador: Prestador | null;
}

const PrestadoresForm: React.FC<PrestadoresFormProps> = ({ prestador }) => {
  if (!prestador) return <p>No se encontró el prestador</p>;

  return (
    <div className="prestador-form">
      <div className="form-row">
        <label>CUIL</label>
        <span>{prestador.numeroCUIL}</span>
      </div>
      <div className="form-row">
        <label>Nombre / Razón Social</label>
        <span>{prestador.nombreCompleto}</span>
      </div>
      <div className="form-row">
        <label>Tipo de prestación</label>
        <span>{prestador.tipoPrestacion}</span>
      </div>
      <div className="form-row">
        <label>Especialidades</label>
        {prestador.especialidades.length > 0
          ? prestador.especialidades.map((esp, i) => <span key={i}>{esp}</span>)
          : <span>No posee especialidades</span>}
      </div>
      <div className="form-row">
        <label>Teléfonos</label>
        {prestador.telefono.map((tel, i) => <span key={i}>{tel}</span>)}
      </div>
      <div className="form-row">
        <label>Emails</label>
        {prestador.email.map((e, i) => <span key={i}>{e}</span>)}
      </div>
      <div className="form-row">
        <label>Direcciones</label>
        {prestador.direccion.map((d, i) => (
          <div key={i} className="direccion">
            <span>{`${d.calle} ${d.numero}, ${d.codigoPostal}, ${d.localidad}`}</span>
            <div className="horarios">
              {d.horariosAtencion.map((h, j) => (
                <span key={j}>{`${h.dia}: desde ${h.desde}, turno ${h.duracionTurno}`}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrestadoresForm;
