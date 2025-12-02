import React from "react";
import "./ListaPrestadores.css";
import type { Prestador } from "../../types/prestadores";

const CardDireccionesYHorariosForm: React.FC<{ direcciones: any[]; prestadorId: number }> = ({ direcciones }) => {
  return (
    <div className="card-direcciones-horarios">
      {Array.isArray(direcciones) && direcciones.length > 0 ? (
        direcciones.map((d, i) => <div key={i}>{(d && (d.calle || d.direccion || JSON.stringify(d))) || String(d)}</div>)
      ) : (
        <div style={{ color: "#646b72ff" }}>No hay direcciones registradas</div>
      )}
    </div>
  );
};

import Button from "../genericos/Button";

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
        <span>
          {prestador.esProfesionalIndependiente ? "Profesional Independiente" : "Centro de Salud"}
        </span>
      </div>

      {/* Especialidades */}
      <div className="form-row">
        <label>Especialidades</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", color: "#646b72ff" }}>
          {prestador.especialidades.length > 0
            ? prestador.especialidades.map((esp) => <span key={esp.id}>{esp.nombre}</span>)
            : <span>No posee especialidades asignadas</span>}
        </div>
      </div>

      {/* Datos principales */}
      <div className="form-row">
        <label>CUIL/CUIT</label>
        <span>{prestador.numeroCUIL}</span>
      </div>
      <div className="form-row">
        <label>Nombre completo</label>
        <span>{prestador.nombreCompleto}</span>
      </div>
      <div className="form-row">
        <label>Teléfono</label>
        {prestador.telefono.length > 0
          ? prestador.telefono.map((tel, i) => <span key={i}>{tel}</span>)
          : <span>No registrado</span>}
      </div>
      <div className="form-row">
        <label>Email</label>
        {prestador.email.length > 0
          ? prestador.email.map((email, i) => <span key={i}>{email}</span>)
          : <span>No registrado</span>}
      </div>

      {/* Fecha de baja */}
      <div className="form-row">
        <label>Fecha de baja</label>
        <span>{(prestador as any).fechaBaja || "Activo"}</span>
      </div>

      {/* Card de direcciones y horarios */}
      <CardDireccionesYHorariosForm
        direcciones={prestador.direccion}
        prestadorId={prestador.id} 
      />
      
      <div className="botones-acciones">
        <Button size="large" variant="primary" >Editar</Button>
      </div>
    </div>
    
  );
};

export default PrestadoresForm;
