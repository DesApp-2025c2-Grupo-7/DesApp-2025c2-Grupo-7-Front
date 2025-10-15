import React from "react";
import "./ListaPrestadores.css";
import type { Prestador } from "../../types/prestadores";
import CardDireccionesYHorariosForm from "./CardDireccionesYHorariosForm";

interface PrestadoresFormProps {
  prestador: Prestador | null;
}

const PrestadoresForm: React.FC<PrestadoresFormProps> = ({ prestador }) => {
  if (!prestador) return <p>No se encontró el prestador</p>;

  return (
    <div className="prestador-form">
      {/* Tipo de prestador */}
      <div className="form-row">
        <label>Tipo de prestador</label>
        {prestador.esProfesionalIndependiente ? (
          <span>Profesional Independiente</span>
        ) : (
          <span>Centro de Salud</span>
        )}
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
          {prestador.especialidades.length > 0
            ? prestador.especialidades.map((esp, i) => <span key={i}>{esp}</span>)
            : <span>No posee especialidades asignadas</span>}
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
        {prestador.telefono.map((tel, i) => (
          <span key={i}>{tel}</span>
        ))}
      </div>
      <div className="form-row">
        <label>Email</label>
        {prestador.email.map((email, i) => (
          <span key={i} key={i}>{email}</span>
        ))}
      </div>

      {/* Fecha de baja */}
      <div className="form-row">
        <label>Fecha de baja</label>
        <span>{(prestador as any).fechaBaja || "Activo"}</span>
      </div>

      {/* Card de direcciones y horarios */}
      <CardDireccionesYHorariosForm
        direcciones={prestador.direccion}
        prestadorId={prestador.id} // ✅ pasamos el ID real
      />
    </div>
  );
};

export default PrestadoresForm;
