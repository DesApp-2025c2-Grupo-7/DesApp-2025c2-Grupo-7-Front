import { useState } from "react";
import Input from "../genericos/Input";
import Select from "../genericos/Select";
import CardDireccionesAfiliados from "./CardDireccionesAfiliados";
import "./ListaAfiliados.css";
import Button from "../genericos/Button";
import type { Direccion } from "../../types/afiliados";
import MultipleInput from "../genericos/MultipleInput";
import DireccionInput from "../genericos/DireccionInput";
import SituacionesTerapeuticasInput from "./SituacionesTerapeuticasInput";

type SituacionTerapeutica = {
  diagnostico: string;
  fechaInicio: string;
  fechaFin: string;
};

type FormDataType = {
  credencial: string;
  sufijo: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefonos: string[];
  emails: string[];
  direccion: {
    calle: string;
    numero: string;
    depto: string;
    localidad: string;
    codigoPostal: string;
  }[];
  parentesco: string;
  situacionesTerapeuticas: SituacionTerapeutica[];
  planMedico: string;
  fechaAlta: string;
  fechaBaja: string;
};

export default function AfiliadosFormEdit() {
  /* Hooks */
  const [formData, setFormData] = useState<FormDataType>({
    credencial: "000000-01", // Valor predeterminado
    sufijo: "",
    tipoDocumento: "DNI", // Valor predeterminado
    numeroDocumento: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    telefonos: [""],
    emails: [""],
    direccion: [
      { calle: "", numero: "", depto: "", localidad: "", codigoPostal: "" },
    ],
    parentesco: "Titular", // Valor predeterminado
    situacionesTerapeuticas: [
      { diagnostico: "", fechaInicio: "", fechaFin: "" },
    ],
    planMedico: "Bronce", // Valor predeterminado
    fechaAlta: "",
    fechaBaja: "",
  });

  const [listaSituacionesTerapeuticas] = useState([
    "Diabetes",
    "Hipertension",
    "Alcoholismo",
    "Obesidad",
    "Asma",
  ]);

  const handleInputChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDireccionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedDirecciones = [...formData.direccion];
    updatedDirecciones[index] = {
      ...updatedDirecciones[index],
      [field]: value,
    };
    setFormData({ ...formData, direccion: updatedDirecciones });
  };

  const addDireccionField = () => {
    setFormData({
      ...formData,
      direccion: [
        ...formData.direccion,
        { calle: "", numero: "", depto: "", localidad: "", codigoPostal: "" },
      ],
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      credencial: formData.credencial,
      parentesco: formData.parentesco,
    };
    console.log("Datos del formulario enviados:", dataToSend);
  };

  // Maneja el cambio de una situación terapéutica individual
  const handleSituacionTerapeuticaChange = (
    index: number,
    field: keyof SituacionTerapeutica,
    value: string
  ) => {
    const nuevasSituaciones = [...formData.situacionesTerapeuticas];
    nuevasSituaciones[index] = { ...nuevasSituaciones[index], [field]: value };
    setFormData({ ...formData, situacionesTerapeuticas: nuevasSituaciones });
  };

  return (
    <form className="afiliado-form" onSubmit={handleSubmit}>
      {/* Credencial */}
      <div className="form-row">
        <label>Credencial</label>
        <input
          disabled
          style={{
            background: "#fff",
            border: "1px solid #ccd6e0",
            borderRadius: "8px",
            padding: "0.7rem 1rem",
            fontSize: "0.95rem",
            color: "#2c3e50",
            fontWeight: 500,
            minHeight: "42px",
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
          }}
          value={formData.credencial}
        ></input>
      </div>

      {/* Parentesco */}
      <div className="form-row">
        <label>Parentesco</label>
        <input
          disabled
          value={"Titular"}
          style={{
            background: "#fff",
            border: "1px solid #ccd6e0",
            borderRadius: "8px",
            padding: "0.7rem 1rem",
            fontSize: "0.95rem",
            color: "#2c3e50",
            fontWeight: 500,
            minHeight: "42px",
            display: "flex",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        ></input>
      </div>

      {/* Plan Médico */}
      <div className="form-row-double-item-left">
        <label>Plan médico</label>
        <Select
          className="input-valor"
          name="planMedico"
          onChange={(value: string) => handleInputChange("planMedico", value)}
          options={[
            { value: "Bronce", label: "Bronce" },
            { value: "Plata", label: "Plata" },
            { value: "Oro", label: "Oro" },
            { value: "Platino", label: "Platino" },
          ]}
        />
      </div>

      <div className="form-row"></div>

      {/* Nombre */}
      <div className="form-row">
        <label>Nombre</label>
        <Input
          type="text"
          className="input-valor"
          name="nombre"
          onChange={(value: string) => handleInputChange("nombre", value)}
          required
        />
      </div>

      {/* Apellido */}
      <div className="form-row">
        <label>Apellido</label>
        <Input
          type="text"
          className="input-valor"
          name="apellido"
          onChange={(value: string) => handleInputChange("apellido", value)}
          required
        />
      </div>

      {/* Tipo y número de documento */}
      <div className="form-row-double">
        <div className="form-row-double-item-left">
          <label>Tipo de documento</label>
          <Select
            className="input-valor"
            name="tipoDocumento"
            onChange={(value: string) =>
              handleInputChange("tipoDocumento", value)
            }
            options={[
              { value: "DNI", label: "DNI" },
              { value: "CUIL", label: "CUIL" },
            ]}
          />
        </div>
        <div className="form-row-double-item-right">
          <label>Documento</label>
          <Input
            type="text"
            className="input-valor"
            name="documento"
            onChange={(value: string) =>
              handleInputChange("numeroDocumento", value)
            }
            required
          />
        </div>
      </div>

      {/* Fecha de nacimiento */}
      <div className="form-row">
        <label>Fecha de nacimiento</label>
        <Input type="date" className="input-valor" />
      </div>
      {/* Direcciones dinámicas */}
      <CardDireccionesAfiliados
        direcciones={[]}
        personaId={0}
        modoEdicion={false}

        onDireccionesChange={(direcciones) => console.log('Direcciones:', direcciones)}
      />
      {/*Teléfono*/}
        <Input
          type="date"
          className="input-valor"
          name="fechaNacimiento"
          onChange={(value: string) =>
            handleInputChange("fechaNacimiento", value)
          }
          required
        />
      </div>

      {/* Dirección */}
      <div className="form-row">
        <label>Direcciones</label>
        {formData.direccion.map((direccion, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <DireccionInput
              direccion={direccion}
              onChange={(field, value) =>
                handleDireccionChange(index, field, value)
              }
            />
          </div>
        ))}
        <button
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
            fontWeight: "bold",
            padding: 0,
            marginTop: "5px",
            width: "100%",
            textAlign: "left",
          }}
          type="button"
          onClick={addDireccionField}
        >
          + Agregar dirección
        </button>
      </div>

      {/* Teléfono */}
      <div className="form-row">
        <label>Teléfono</label>
        <MultipleInput
          type="tel"
          name="telefono"
          onChange={(values) => setFormData({ ...formData, telefonos: values })}
        />
      </div>

      {/* Emails */}
      <div className="form-row">
        <label>Emails</label>
        <MultipleInput
          name="email"
          type="email"
          onChange={(values) => setFormData({ ...formData, emails: values })}
        />
      </div>

      {/* Situaciones Terapéuticas */}
      <div
        className="form-row"
        style={{
          display: "flex",
          gap: "5px",
        }}
      >
        <label>Situaciones Terapéuticas</label>
        {formData.situacionesTerapeuticas.map((situacion, index) => (
          <SituacionesTerapeuticasInput
            key={index}
            value={situacion}
            onChange={(field, value) =>
              handleSituacionTerapeuticaChange(
                index,
                field as keyof SituacionTerapeutica,
                value
              )
            }
            listaSituacionesTerapeuticas={listaSituacionesTerapeuticas}
          />
        ))}
        <button
          type="button"
          style={{
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
            fontWeight: "bold",
            padding: 0,
            marginTop: "5px",
            width: "100%",
            textAlign: "left",
          }}
          onClick={() =>
            setFormData({
              ...formData,
              situacionesTerapeuticas: [
                ...formData.situacionesTerapeuticas,
                { diagnostico: "", fechaInicio: "", fechaFin: "" },
              ],
            })
          }
        >
          + Agregar situación terapéutica
        </button>
      </div>

      <div className="form-row"></div>
      <div className="form-row"></div>
      <div
        style={{
          width: "100%",
          display: "flex",
          gap: "10px",
        }}
      >
        <Button type="submit">Cancelar</Button>
        <Button type="submit">Dar de alta</Button>
      </div>
    </form>
  );
}

/* EXTRA
0. Quitar del HeaderAfiliado ambos botones.
1. Agregar en todos los "Agregar x cosa" un eliminar.
2. Agregar validaciones de la fecha desde y hasta de la Situacion terapeutica.
3. Agregar que, al dar de alta al afiliado nos lleve al perfil de dicho afiliado dado de alta.
4. Agregar funcionalidad al botón "Cancelar", al tocarlo nos devolverá al menú de Gestionar Afiliados.
5. 
*/
