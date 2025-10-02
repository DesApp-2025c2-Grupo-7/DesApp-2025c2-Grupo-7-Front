// PrestadoresForm.tsx
import React from "react";
import "./ListaPrestadores.css";
import Button from "../genericos/Button"; "../components/genericos/Button";
import type { Prestador } from "../../types/prestadores";


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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem 0.2rem", color: "#646b72ff" }}>
                {prestador.especialidades?.map((esp, i) => (
                  <span
                    key={i}
                  >
                    {esp}
                  </span>
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
              {prestador?.telefono.map((tel) => <span>{tel}</span> )}
            </div>
          
            <div className="form-row">
              <label>Email</label>
              {prestador?.email.map((email) => <span>{email}</span> )}
            </div>
             {/* Fecha de baja */}
            <div className="form-row">
              <label>Fecha de baja</label>
              <span>{(prestador as any).fechaBaja || "Activo"}</span>
            </div>
           
            {/* Direcciones y horarios */}
            <div className="schedules">
              <h4>Direcciones y Horarios de atención</h4>
              {prestador.direccion?.map((dir, i) => (
                <div className="schedule-card" key={i}>
                  <div className="schedule-header">
                    <h4>
                      Dirección: {dir.calle} {dir.numero}, {dir.localidad} (
                      {dir.codigoPostal || "—"})
                    </h4>
                  </div>
                  <div className="schedule-list">
                    {dir.horariosAtencion?.map((hor, j) => (
                      <div className="schedule-item" key={j}>
                        <strong>{hor.dia}</strong> - {hor.desde} a {hor.hasta}
                        <span className="schedule-badge">
                          Turnos: {hor.duracionTurno}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="schedule-actions">
                    <Button variant="primary" size="small" >Ver más</Button> {/* Yo lo quitaría. Toda la información ya la mostraría la card */}
                    <Button variant="secondary" size="small">Editar</Button>
                  </div>
                </div>
              ))}
              <div className="flex-row">
                <Button className="add-schedule">
                  + Agregar nueva dirección
                </Button>
                 <Button className="add-schedule">
                  + Agregar nuevo horario de atención
                </Button>
              </div>
            </div>

          
          </div>
        ) : (
          <p>No se encontró el prestador</p>
        )}
    </>
  );
};

export default PrestadoresForm;
