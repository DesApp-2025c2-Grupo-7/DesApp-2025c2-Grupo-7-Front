// PrestadoresForm.tsx
import React from "react";
import "./ListaPrestadores.css";
import Button from "../genericos/Button";
import Input from "../genericos/Input";
import Select from "../genericos/Select";
import CardEspecialidades from "./CardEspecialidades";

const PrestadoresFormEdit: React.FC = ({}) => {
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
            <CardEspecialidades
              especialidades={["Cardiología", "Pediatría", "Traumatología"]}
            ></CardEspecialidades>
          </div>
        </div>

        {/* Datos principales */}
        <div className="form-row">
          <label>Nro de CUIL o CUIT</label>
          <Input type="text" />
        </div>
        <div className="form-row">
          <label>Nombre completo</label>
          <Input type="text" />
        </div>
        <div className="form-row">
          <label>Teléfono</label>
          <Input type="tel" />
          <button>+ Agregar teléfono</button>
        </div>

        <div className="form-row">
          <label>Email</label>
          <Input type="email" />
          <button>+ Agregar email</button>
        </div>

        {/* Direcciones y horarios */}
        <div className="schedules">
          <h4>Direcciones y Horarios de atención</h4>
          <div className="flex-row">
            <Button className="add-schedule">+ Agregar nueva dirección</Button>
            <Button className="add-schedule">
              + Agregar nuevo horario de atención
            </Button>
          </div>
        </div>
        <Button>Dar de alta</Button>
      </div>
    </>
  );
};

export default PrestadoresFormEdit;
