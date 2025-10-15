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
    <div className="schedules">import React, { useState } from "react";
import Button from "../genericos/Button";
import ModalDireccion from "./ModalDireccion";
import type { Direccion, HorarioAtencion } from "../../types/prestadores";

// Función para convertir "HH:MM" a minutos
const horaAMinutos = (hora: string) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

// Calcula cantidad de turnos en un horario
const calcularTurnos = (horario: HorarioAtencion) => {
  if (!horario.desde || !horario.hasta || !horario.duracionTurno) return 0;

  const inicio = horaAMinutos(horario.desde);
  const fin = horaAMinutos(horario.hasta);

  // Extraemos solo los números de duracionTurno
  let duracion = 0;
  if (horario.duracionTurno.includes(":")) {
    duracion = horaAMinutos(horario.duracionTurno);
  } else {
    const match = horario.duracionTurno.match(/\d+/);
    duracion = match ? Number(match[0]) : 0;
  }

  if (duracion <= 0) return 0;
  return Math.floor((fin - inicio) / duracion);
};

interface CardDireccionesYHorariosFormProps {
  direcciones?: Direccion[];
  prestadorId: number;
}

const CardDireccionesYHorariosForm: React.FC<CardDireccionesYHorariosFormProps> = ({
  direcciones = [],
  prestadorId,
}) => {
  const [listaDirecciones, setListaDirecciones] = useState<Direccion[]>(direcciones);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);

  const handleVerMas = (direccion: Direccion) => {
    setDireccionSeleccionada(direccion);
  };

  const handleCloseModal = () => setDireccionSeleccionada(null);

  const handleSaveDireccion = (dirActualizada: Direccion) => {
    setListaDirecciones(prev => {
      const existe = prev.find(d => d.id === dirActualizada.id);
      if (existe) {
        // Reemplaza la dirección existente
        return prev.map(d => (d.id === dirActualizada.id ? dirActualizada : d));
      } else {
        // Agrega nueva dirección
        return [...prev, dirActualizada];
      }
    });
    setDireccionSeleccionada(null);
  };

  const handleAgregarNuevaDireccion = () => {
    const nuevaDireccion: Direccion = {
      id: 0,
      calle: "",
      numero: "",
      localidad: "",
      codigoPostal: "",
      horariosAtencion: [],
    };
    handleVerMas(nuevaDireccion);
  };

  const handleEliminarDireccion = async (direccion: Direccion) => {
    if (!window.confirm("¿Deseas eliminar esta dirección y todos sus horarios?")) return;

    try {
      for (const hor of direccion.horariosAtencion) {
        if (hor.id) {
          await fetch(
            `http://localhost:3000/prestadores/${prestadorId}/direcciones/${direccion.id}/horarios/${hor.id}`,
            { method: "DELETE" }
          );
        }
      }

      await fetch(`http://localhost:3000/prestadores/${prestadorId}/direcciones/${direccion.id}`, {
        method: "DELETE",
      });

      setListaDirecciones(prev => prev.filter(d => d.id !== direccion.id));
    } catch (err) {
      console.error("Error eliminando dirección y horarios", err);
      alert("No se pudo eliminar la dirección");
    }
  };

  return (
    <div className="schedules">
      <h4>Direcciones y Horarios de atención</h4>
      <br />
      <div>
        {listaDirecciones.map((dir, i) => (
        <div className="schedule-card" key={i}>
          <div className="schedule-header">
            <h4>
              Dirección: {dir.calle} {dir.numero}, {dir.localidad} ({dir.codigoPostal || "—"})
            </h4>
          </div>

          <div className="schedule-list">
            {dir.horariosAtencion?.map((hor, j) => (
              <div className="schedule-item" key={j}>
                <strong>{hor.dia}</strong> - {hor.desde} a {hor.hasta}
                <span className="schedule-badge">
                  Duración: {hor.duracionTurno} | Turnos: {calcularTurnos(hor)}
                </span>
              </div>
            ))}
          </div>

          <div
            className="schedule-actions"
            style={{
              position: "sticky",
              bottom: 0,
              background: "#fff",
              padding: "0.5rem 0",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <Button variant="primary" size="small" onClick={() => handleVerMas(dir)}>
              Editar
            </Button>
            <Button variant="danger" size="small" onClick={() => handleEliminarDireccion(dir)}>
              Eliminar
            </Button>
          </div>
        </div>
      ))}
      </div>

      <div className="flex-row" style={{ marginTop: "1rem" }}>
        <Button className="add-schedule" onClick={handleAgregarNuevaDireccion}>
          + Agregar nueva dirección
        </Button>
      </div>

      {direccionSeleccionada && (
        <ModalDireccion
          prestadorId={prestadorId}
          direccion={direccionSeleccionada}
          todasDirecciones={listaDirecciones}
          onClose={handleCloseModal}
          onSave={handleSaveDireccion}
        />
      )}
    </div>
  );
};

export default CardDireccionesYHorariosForm;

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
