import Input from "../genericos/Input";
import Select from "../genericos/Select";
import CardDireccionesAfiliados from "./CardDireccionesAfiliados";
import "./ListaAfiliados.css";
import Button from "../genericos/Button";
import type { Direccion } from "../../types/afiliados";

export default function AfiliadosFormEdit() {
  return (
    <div className="afiliado-form">
      {/* Credencial */}
      <div className="form-row">
        <label>Credencial</label>
        <span>0000000-01</span>
      </div>

      {/* Parentesco */}
      <div className="form-row">
        <label>Parentesco</label>
        <span>Titular</span>
      </div>

      {/* Nombre */}
      <div className="form-row">
        <label>Nombre</label>
        <Input type="text" className="input-valor" />
      </div>

      {/* Apellido */}
      <div className="form-row">
        <label>Apellido</label>
        <Input type="text" className="input-valor" />
      </div>

      {/* Tipo y número de documento */}
      <div className="form-row-double">
        <div className="form-row-double-item-left">
          <label>Tipo de documento</label>
          <Select
            className="input-valor"
            options={[
              { value: "DNI", label: "DNI" },
              { value: "CUIL", label: "CUIL" },
            ]}
          />
        </div>
        <div className="form-row-double-item-right">
          <label>Documento</label>
          <Input type="text" className="input-valor" />
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
      <div className="form-row">
        <label>Teléfono</label>
        <Input type="tel" name="telefono"></Input>
      </div>
      {/*Email*/}
      <div className="form-row">
        <label>Email</label>
        <Input type="email" name="email"></Input>
      </div>
      <div className="form-row"></div>
      {/*Email*/}
      <Button>Dar de alta</Button>
    </div>
  );
}

/* EXTRA:
1. Agregar botón para + emails, direcciones o teléfonos.
2. Agregar Situaciones terapéuticas y fecha de alta.
3. Mejorar la parte estética.
 */
