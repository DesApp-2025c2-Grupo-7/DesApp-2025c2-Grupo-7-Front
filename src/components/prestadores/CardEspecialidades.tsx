import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import type { Especialidad } from "../../types/prestadores";

interface CardEspecialidadesProps {
  especialidades: Especialidad[];
  seleccionadas: Especialidad[];
  onChange: (seleccionadas: Especialidad[]) => void;
}

export default function CardEspecialidades({
  especialidades,
  seleccionadas,
  onChange,
}: CardEspecialidadesProps) {
  const handleCheckboxChange = (esp: Especialidad) => {
    if (seleccionadas.some((e) => e.id === esp.id)) {
      onChange(seleccionadas.filter((e) => e.id !== esp.id));
    } else {
      onChange([...seleccionadas, esp]);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "1rem auto" }}>
      <CardContent>
        {especialidades.map((esp) => (
          <div key={esp.id}>
            <input
              type="checkbox"
              id={esp.id.toString()}
              checked={seleccionadas.some((e) => e.id === esp.id)}
              onChange={() => handleCheckboxChange(esp)}
            />
            <label htmlFor={esp.id.toString()}>{esp.nombre}</label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
