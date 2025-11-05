import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../genericos/Button";
import type { Prestador } from "../../types/prestadores";
import { getApiUrl } from "../../config/env";

type ListaPrestadoresProps = {
  prestadores?: Prestador[];
};

import "./ListaPrestadores.css";

const ListaPrestadores: React.FC<ListaPrestadoresProps> = () => {
  const navigate = useNavigate();
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Traer prestadores del backend
  const fetchPrestadores = async () => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl("/prestadores"));
      const text = await res.text();

      let data: Prestador[];
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respuesta inválida del servidor: no es JSON");
      }

      setPrestadores(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error al cargar los prestadores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestadores();
  }, []);

  // Navegar al perfil
  const handleVerMas = (id: number) => {
    navigate(`/prestadores/${id}`);
  };

  // Eliminar prestador
  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Estás seguro que quieres eliminar este prestador?")) return;

    try {
      const res = await fetch(getApiUrl(`/prestadores/${id}`), { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el prestador");
      // Actualizar lista localmente
      setPrestadores(prestadores.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Ocurrió un error al eliminar el prestador");
    }
  };

  if (loading) return <p>Cargando prestadores...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (prestadores.length === 0) return <p>No se encontraron prestadores</p>;

  return (
    <div className="prestadores-cards">
      <h3>Resultados</h3>
      <div className="cards-grid">
        {prestadores.map((prestador) => (
          <div key={prestador.id} className="prestador-card">
            <div className="card-header">
              <h4 className="prestador-nombre">{prestador.nombreCompleto}</h4>
              {prestador.especialidades.length > 0
                ? prestador.especialidades.map((especialidad) => (
                    <span key={especialidad.id} className="prestador-especialidad">
                      {especialidad.nombre}
                    </span>
                  ))
                : <span>No posee especialidades</span>
              }
            </div>
            <div className="card-actions">
              <Button
                variant="primary"
                size="small"
                onClick={() => handleVerMas(prestador.id)}
              >
                + Ver más
              </Button>
              <Button
                variant="danger"
                size="small"
                icon={Trash2}
                iconPosition="left"
                onClick={() => handleEliminar(prestador.id)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaPrestadores;
