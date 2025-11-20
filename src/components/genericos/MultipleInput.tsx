import { useState } from "react";
import Input from "./Input";
import { Trash2 } from "lucide-react";
import type { TipoValidacion } from "../../utils/validaciones";

type MultipleInputProps = {
  name: string;
  type:
    | "number"
    | "search"
    | "text"
    | "email"
    | "password"
    | "tel"
    | "url"
    | "date";
  className?: string;
  placeholder?: string;
  onChange?: (values: string[]) => void;
};

export default function MultipleInput({
  name,
  type,
  className,
  placeholder,
  onChange,
}: MultipleInputProps) {
  const [values, setValues] = useState<string[]>([""]);

  const handleInputChange = (index: number, value: string) => {
    const updatedValues = [...values];
    updatedValues[index] = value;
    setValues(updatedValues);
    onChange?.(updatedValues);
  };

  const addInputField = () => {
    setValues([...values, ""]);
  };

  const removeInputField = (index: number) => {
    const updatedValues = values.filter((_, i) => i !== index);
    setValues(updatedValues);
    onChange?.(updatedValues);
  };

  // Determinar el tipo de validación según el tipo de input
  const getValidationType = (): TipoValidacion => {
    if (type === "email") return "email";
    if (type === "tel") return "telefono";
    return "requerido";
  };

  return (
    <div>
      {values.map((value, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          <Input
            type={type}
            name={`${name}-${index}`}
            className={className}
            placeholder={placeholder}
            value={value}
            onChange={(val: string) => handleInputChange(index, val)}
            required
            validationType={getValidationType()}
            showValidation={true}
          />

          {values.length > 1 && (
            <button
              type="button"
              onClick={() => removeInputField(index)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "#d11a2a",
              }}
              title="Eliminar"
            >
              <Trash2 size={18} color="#d11a2a" />
            </button>
          )}
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
        }}
        type="button"
        onClick={addInputField}
      >
        {"+ Agregar " + name}
      </button>
    </div>
  );
}
