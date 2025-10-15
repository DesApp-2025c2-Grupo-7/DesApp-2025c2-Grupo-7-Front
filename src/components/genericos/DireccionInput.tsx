import Input from "./Input";
import "./DireccionInput.css";

type DireccionInputProps = {
  direccion: {
    calle: string;
    numero: string;
    depto: string;
    localidad: string;
    codigoPostal: string;
  };
  onChange: (field: string, value: string) => void;
};

export default function DireccionInput({
  direccion,
  onChange,
}: DireccionInputProps) {
  const handleFieldChange = (field: string, value: string) => {
    onChange(field, value);
  };

  return (
    <div className="direccion-input">
      <Input
        type="text"
        name="calle"
        placeholder="Calle"
        value={direccion.calle}
        onChange={(value) => handleFieldChange("calle", value)}
        className="direccion-calle"
        required
      />
      <Input
        type="text"
        name="numero"
        placeholder="Número"
        value={direccion.numero}
        onChange={(value) => handleFieldChange("numero", value)}
        className="direccion-numero"
        required
      />
      <Input
        type="text"
        name="depto"
        placeholder="Departamento"
        value={direccion.depto}
        onChange={(value) => handleFieldChange("depto", value)}
        className="direccion-depto"
      />
      <Input
        type="text"
        name="localidad"
        placeholder="Localidad"
        value={direccion.localidad}
        onChange={(value) => handleFieldChange("localidad", value)}
        className="direccion-localidad"
        required
      />
      <Input
        type="text"
        name="codigoPostal"
        placeholder="Código Postal"
        value={direccion.codigoPostal}
        onChange={(value) => handleFieldChange("codigoPostal", value)}
        className="direccion-codigoPostal"
        required
      />
    </div>
  );
}
