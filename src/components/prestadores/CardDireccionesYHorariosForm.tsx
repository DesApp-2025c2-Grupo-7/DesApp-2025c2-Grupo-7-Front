import React from "react";
import Button from "../genericos/Button";
import type { Direccion } from "../../types/prestadores";

interface CardDireccionesYHorariosFormProps {
  direcciones?: Direccion[];
}

const CardDireccionesYHorariosForm: React.FC<
  CardDireccionesYHorariosFormProps
> = ({ direcciones = [] }) => {
  return (
    <div className="schedules">
      <h4>Direcciones y Horarios de atención</h4>
      {direcciones.map((dir, i) => (
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
            <Button variant="primary" size="small">
              Ver más
            </Button>{" "}
            <Button variant="secondary" size="small">
              Editar
            </Button>
          </div>
        </div>
      ))}
      <div className="flex-row">
        <Button className="add-schedule">+ Agregar nueva dirección</Button>
        <Button className="add-schedule">
          + Agregar nuevo horario de atención
        </Button>
      </div>
    </div>
  );
};

export default CardDireccionesYHorariosForm;
