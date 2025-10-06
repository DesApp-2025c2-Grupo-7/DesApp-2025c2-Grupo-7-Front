import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

interface CardEspecialidadesProps {
  especialidades: string[];
}

export default function CardEspecialidades({
  especialidades,
}: CardEspecialidadesProps) {
  return (
    <Card sx={{ maxWidth: 400, margin: "1rem auto" }}>
      <CardContent>
        {especialidades.map((especialidad) => {
          return (
            <>
              <input type="checkbox" id={especialidad}></input>
              <label htmlFor={especialidad}>{especialidad}</label>
            </>
          );
        })}
      </CardContent>
    </Card>
  );
}
