/* import Button from "../genericos/Button";
 */

export default function CardDireccionesYHorariosEdit() {
  return (
    <div className="schedule-card">
      <div className="schedule-header">
        <h4>
          Dirección: <input type="text" placeholder="Calle" />{" "}
        </h4>
      </div>
      <div className="schedule-list">
        <div className="schedule-item">
          <strong>
            <input type="text" placeholder="Día" />
          </strong>{" "}
          - <input type="time" placeholder="Desde" /> a{" "}
          <input type="time" placeholder="Hasta" />
          <span className="schedule-badge">
            Turnos: <input type="number" placeholder="Duración" />
          </span>
        </div>
      </div>
      {/* <div className="schedule-actions">
        <Button variant="primary" size="small">
          Ver más
        </Button>
      </div> */}
    </div>
  );
}

/* EXTRA

1. Agregar botón al lado de "Día y horarios de atención" que diga "Agregar "
2. Agregar botón para cancelar/eliminar el día agregado.
3. Cuando se agreguen Horarios de atención deberían moverse de manera horizontal. */
