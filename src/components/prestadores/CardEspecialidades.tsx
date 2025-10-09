import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

interface CardEspecialidadesProps {
  especialidades: string[];
  seleccionadas: string[];
  onChange: (seleccionadas: string[]) => void;
}

export default function CardEspecialidades({
  especialidades,
  seleccionadas,
  onChange,
}: CardEspecialidadesProps) {
  const handleCheckboxChange = (nombre: string) => {
    if (seleccionadas.includes(nombre)) {
      onChange(seleccionadas.filter((e) => e !== nombre));
    } else {
      onChange([...seleccionadas, nombre]);
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "1rem auto" }}>
      <CardContent>
        {especialidades.map((especialidad) => (
          <div key={especialidad}>
            <input
              type="checkbox"
              id={especialidad}
              checked={seleccionadas.includes(especialidad)}
              onChange={() => handleCheckboxChange(especialidad)}
            />
            <label htmlFor={especialidad}>{especialidad}</label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
