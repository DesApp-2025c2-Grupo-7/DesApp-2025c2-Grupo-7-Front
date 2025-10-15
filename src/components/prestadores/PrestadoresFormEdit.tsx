import React, { useState, useEffect } from "react";
import "./ListaPrestadores.css";
import Button from "../genericos/Button";
import Input from "../genericos/Input";
import Select from "../genericos/Select";
import CardEspecialidades from "./CardEspecialidades";
import CardDireccionesYHoariosEdit from "./CardDireccionesYHorariosEdit";

const PrestadoresFormEdit: React.FC = ({}) => {
  /* Para agregar otros inputs de teléfonos */
  const [telefonos, setTelefonos] = useState<string[]>([""]);

  const agregarTelefono = () => {
    setTelefonos([...telefonos, ""]);
  };

  const actualizarTelefono = (index: number, valor: string) => {
    const nuevosTelefonos = [...telefonos];
    nuevosTelefonos[index] = valor;
    setEmails(nuevosTelefonos); /* Modificar a setTelefonos */
  };

  /* Para agregar otros inputs de emails */
  const [emails, setEmails] = useState<string[]>([""]);

  const agregarEmail = () => {
    setEmails([...emails, ""]);
  };

  const actualizarEmail = (index: number, valor: string) => {
    const nuevosEmails = [...emails];
    nuevosEmails[index] = valor;
    setEmails(nuevosEmails);
  };

  /* Para mostrar el form al agregar una dirección con sus horarios de atención */

  const [direccionesYHorarios, setDireccionesYHorarios] = useState<number[]>(
    []
  );

  /* Para mostrar las especialidades desde el seed */

  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/especialidades")
      .then((res) => res.json())
      .then((data) => {
        const nombres = data.map((esp: any) => esp.nombre);
        setEspecialidades(nombres);
      })
      .catch((err) => {
        console.error("Error al cargar especialidades:", err);
      });
  }, []);

  return (
    <>
      <div className="prestador-form">
        <div className="form-row">
          <label>Tipo de prestador</label>
          <Select
            options={[
              {
                value: "Centro Médico",
                label: "Centro Médico",
              },
              {
                value: "Profesional Independiente",
                label: "Profesional Independiente",
              },
            ]}
          />
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
            <div>
              <CardEspecialidades
                especialidades={especialidades}
                seleccionadas={seleccionadas}
                onChange={setSeleccionadas}
              />
            </div>
          </div>
        </div>

        {/* Datos principales */}
        {/* Número de CUIL o CUIT */}
        <div className="form-row">
          <label>Nro de CUIL o CUIT</label>
          <Input type="text" />
        </div>

        {/* Nombre completo */}
        <div className="form-row">
          <label>Nombre completo</label>
          <Input type="text" />
        </div>

        {/* Teléfono */}
        <div className="form-row">
          <label>Teléfono</label>
          <Input
            type="tel"
            value={telefonos[0]}
            onChange={(valor) => actualizarTelefono(0, valor)}
          />
          <button type="button" onClick={agregarTelefono}>
            + Agregar Teléfono
          </button>
          {telefonos.slice(1).map((telefono, index) => (
            <Input
              key={index + 1}
              type="tel"
              value={telefono}
              onChange={(valor) => actualizarTelefono(index + 1, valor)}
            />
          ))}
        </div>
        {/* Email */}
        <div className="form-row">
          <label>Email</label>
          <Input
            type="email"
            value={emails[0]}
            onChange={(valor) => actualizarEmail(0, valor)}
          />
          <button type="button" onClick={agregarEmail}>
            + Agregar email {/* Modificar texto */}
          </button>
          {emails.slice(1).map((email, index) => (
            <Input
              key={index + 1}
              type="email"
              value={email}
              onChange={(valor) => actualizarEmail(index + 1, valor)}
            />
          ))}
        </div>

        {/* Direcciones y horarios */}
        <div className="schedules">
          <h4>Direcciones y Horarios de atención</h4>
          <div className="flex-column">
            <Button
              className="add-schedule"
              onClick={() =>
                setDireccionesYHorarios((prev) => [...prev, Date.now()])
              }
            >
              + Agregar nueva dirección
            </Button>

            {direccionesYHorarios.map((id) => (
              <CardDireccionesYHoariosEdit key={id} />
            ))}
          </div>
        </div>
        <Button>Dar de alta</Button>
      </div>
    </>
  );
};

export default PrestadoresFormEdit;

/* EXTRA, para agregar/mejorar */
{
  /* 1: Indicar un tope máximo de inputs para teléfono, mails y días y horarios de atención */
  /* 2: Poder eliminar/cancelar el agregado de un teléfono o emails*/
  /* 3: Ver si queda el botón "Agregar especialidades o si se guarda al tocar "Dar de alta"*/
  /* 4: Sí o sí debe haber al menos una dirección agregada para poder dar de alta*/
}
