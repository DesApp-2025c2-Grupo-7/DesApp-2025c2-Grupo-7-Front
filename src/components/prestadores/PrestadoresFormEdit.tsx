import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ListaPrestadores.css";
import Button from "../genericos/Button";
import Input from "../genericos/Input";
import Select from "../genericos/Select";
import CardEspecialidades from "./CardEspecialidades";
import ModalDireccion from "./ModalDireccion";
import type { Direccion, HorarioAtencion, Especialidad } from "../../types/prestadores";

const horaAMinutos = (hora?: string) => {
  if (!hora) return 0;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

const calcularTurnos = (horario: HorarioAtencion) => {
  if (!horario.desde || !horario.hasta || !horario.duracionTurno) return 0;

  const inicio = horaAMinutos(horario.desde);
  const fin = horaAMinutos(horario.hasta);

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

const PrestadoresFormEdit: React.FC = () => {
  const navigate = useNavigate();

  /* Teléfonos */
  const [telefonos, setTelefonos] = useState<string[]>([""]);
  const agregarTelefono = () => setTelefonos([...telefonos, ""]);
  const actualizarTelefono = (index: number, valor: string) => {
    const nuevos = [...telefonos];
    nuevos[index] = valor;
    setTelefonos(nuevos);
  };

  /* Emails */
  const [emails, setEmails] = useState<string[]>([""]);
  const agregarEmail = () => setEmails([...emails, ""]);
  const actualizarEmail = (index: number, valor: string) => {
    const nuevos = [...emails];
    nuevos[index] = valor;
    setEmails(nuevos);
  };

  /* Tipo de prestador */
  const [tipoPrestador, setTipoPrestador] = useState<string>("Centro Médico");

  /* Especialidades */
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<Especialidad[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/especialidades")
      .then((res) => res.json())
      .then((data: Especialidad[]) => {
        setEspecialidades(data);
      })
      .catch((err) => console.error("Error al cargar especialidades:", err));
  }, []);

  /* Direcciones y horarios */
  const [listaDirecciones, setListaDirecciones] = useState<Direccion[]>([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);

  const handleVerMas = (direccion: Direccion) => setDireccionSeleccionada(direccion);
  const handleCloseModal = () => setDireccionSeleccionada(null);

  const handleSaveDireccion = (dirActualizada: Direccion) => {
    setListaDirecciones((prev) => {
      const existe = prev.find((d) => d.id === dirActualizada.id);
      if (existe) {
        return prev.map((d) => (d.id === dirActualizada.id ? dirActualizada : d));
      } else {
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
            `http://localhost:3000/prestadores/1/direcciones/${direccion.id}/horarios/${hor.id}`,
            { method: "DELETE" }
          );
        }
      }

      await fetch(`http://localhost:3000/prestadores/1/direcciones/${direccion.id}`, {
        method: "DELETE",
      });

      setListaDirecciones((prev) => prev.filter((d) => d.id !== direccion.id));
    } catch (err) {
      console.error("Error eliminando dirección y horarios", err);
      alert("No se pudo eliminar la dirección");
    }
  };

  /* Inputs principales */
  const [nombre, setNombre] = useState("");
  const [cuil, setCuil] = useState("");

  const handleDarDeAlta = async () => {
    try {
      const prestadorData = {
        esProfesionalIndependiente: tipoPrestador === "Profesional Independiente",
        nombreCompleto: nombre,
        numeroCUIL: cuil,
        telefono: telefonos,
        email: emails,
        especialidades: seleccionadas.map((esp) => ({
          id: esp.id,
          nombre: esp.nombre,
        })),
        direccion: listaDirecciones,
      };

      const res = await fetch("http://localhost:3000/prestadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prestadorData),
      });

      if (!res.ok) throw new Error("Error al dar de alta el prestador");

      const data = await res.json();
      alert("Prestador dado de alta correctamente!");
      console.log("Prestador creado:", data);

      // Navegar al perfil del prestador recién creado
      navigate(`/prestadores/${data.id}`);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al dar de alta el prestador");
    }
  };

  return (
    <div className="prestador-form">
      <div className="form-row">
        <label>Tipo de prestador</label>
        <Select
          options={[
            { value: "Centro Médico", label: "Centro Médico" },
            { value: "Profesional Independiente", label: "Profesional Independiente" },
          ]}
          value={tipoPrestador}
          onChange={(valor: string) => setTipoPrestador(valor)}
        />
      </div>

      {/* Especialidades */}
      <div className="form-row">
        <label>Especialidades</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem 0.2rem", color: "#646b72ff" }}>
          <CardEspecialidades
            especialidades={especialidades}
            seleccionadas={seleccionadas}
            onChange={setSeleccionadas}
          />
        </div>
      </div>

      {/* CUIL / Nombre */}
      <div className="form-row">
        <label>Nro de CUIL o CUIT</label>
        <Input type="text" value={cuil} onChange={setCuil} />
      </div>
      <div className="form-row">
        <label>Nombre completo</label>
        <Input type="text" value={nombre} onChange={setNombre} />
      </div>

      {/* Teléfonos */}
      <div className="form-row">
        <label>Teléfonos</label>
        {telefonos.map((tel, i) => (
          <Input key={i} type="tel" value={tel} onChange={(v) => actualizarTelefono(i, v)} />
        ))}
        <button type="button" onClick={agregarTelefono}>
          + Agregar teléfono
        </button>
      </div>

      {/* Emails */}
      <div className="form-row">
        <label>Emails</label>
        {emails.map((mail, i) => (
          <Input key={i} type="email" value={mail} onChange={(v) => actualizarEmail(i, v)} />
        ))}
        <button type="button" onClick={agregarEmail}>
          + Agregar email
        </button>
      </div>

      {/* Direcciones y horarios */}
      <div className="schedules">
        <h4>Direcciones y Horarios de atención</h4>
        <div className="schedules-container">
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
              <div className="schedule-actions">
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

        <div className="fixed-add-button">
          <Button className="add-schedule" onClick={handleAgregarNuevaDireccion}>
            + Agregar nueva dirección
          </Button>
        </div>

        {direccionSeleccionada && (
          <ModalDireccion
            prestadorId={0}
            direccion={direccionSeleccionada}
            todasDirecciones={listaDirecciones}
            onClose={handleCloseModal}
            onSave={handleSaveDireccion}
          />
        )}
      </div>

      <Button onClick={handleDarDeAlta}>Dar de alta</Button>
    </div>
  );
};

export default PrestadoresFormEdit;
