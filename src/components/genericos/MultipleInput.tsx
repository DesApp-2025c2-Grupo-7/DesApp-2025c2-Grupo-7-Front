import { useState } from "react";
import Input from "./Input";

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
    if (onChange) {
      onChange(updatedValues);
    }
  };

  const addInputField = () => {
    setValues([...values, ""]);
  };

  return (
    <div>
      {values.map((value, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <Input
            type={type}
            name={`${name}-${index}`}
            className={className}
            placeholder={placeholder}
            value={value}
            onChange={(val: string) => handleInputChange(index, val)}
            required
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
        }}
        type="button"
        onClick={addInputField}
      >
        {"+ Agregar " + name}
      </button>
    </div>
  );
}
