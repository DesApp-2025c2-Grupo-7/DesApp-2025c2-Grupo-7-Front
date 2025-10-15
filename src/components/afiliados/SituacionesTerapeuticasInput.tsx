import Input from "../genericos/Input";
import Select from "../genericos/Select";

type SituacionesTerapeuticasProps = {
  value: {
    diagnostico: string;
    fechaInicio: string;
    fechaFin: string;
  };
  onChange: (field: string, value: string) => void;
  listaSituacionesTerapeuticas: string[];
};

export default function SituacionesTerapeuticasInput({
  value,
  onChange,
  listaSituacionesTerapeuticas,
}: SituacionesTerapeuticasProps) {
  const handleFieldChange = (field: string, value: string) => {
    onChange(field, value);
  };
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
      }}
    >
      <Select
        name="diagnostico"
        value={value.diagnostico}
        placeholder="Seleccione un diagnóstico"
        onChange={(val) => handleFieldChange("diagnostico", val)}
        options={listaSituacionesTerapeuticas.map((situacion: string) => {
          return { value: situacion, label: situacion };
        })}
      />
      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <Input
          type="date"
          placeholder="Fecha de inicio"
          name="fechaInicio"
          value={value.fechaInicio}
          onChange={(val) => handleFieldChange("fechaInicio", val)}
        />
        <Input
          type="date"
          placeholder="Fecha de fin"
          name="fechaFin"
          value={value.fechaFin}
          onChange={(val) => handleFieldChange("fechaFin", val)}
        />
      </div>
    </div>
  );
}
