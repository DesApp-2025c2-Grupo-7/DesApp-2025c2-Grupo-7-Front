import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/genericos/Header";
import HeaderPrestador from "../components/prestadores/HeaderPrestadores"; // 👈 nuevo header
import PrestadoresForm from "../components/prestadores/PrestadoresForm"; // 👈 nuevo form
import "./PrestadorProfile.css";
import type { Prestador } from "../types/prestadores";

// ---- Componente ----
const PrestadorProfile: React.FC = () => {
  const [prestador, setPrestador] = useState<Prestador | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;

    const fetchPrestador = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/prestadores/${id}`); 
        if (!response.ok) {
          throw new Error("Error al obtener los datos del prestador");
        }
        const data: Prestador = await response.json();
        setPrestador(data);
      } catch (error) {
        console.error(error);
        setPrestador(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestador();
  }, [id]);

  const handleVolver = () => navigate("/prestadores");

  // --- Render skeleton mientras carga ---
  if (loading) {
    return (
      <div className="admin-page">
        <Header
          title="Panel de Administración"
          subtitle="Prestador - Información y estado"
        />
        <div className="admin-content">
          <HeaderPrestador onVolver={handleVolver} />
          <div className="prestador-form">
            {Array.from({ length: 10 }).map((_, i) => (
              <div className="form-row" key={i}>
                <label>&nbsp;</label>
                <span className="skeleton">&nbsp;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Render normal cuando ya se cargaron los datos ---
  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Prestador - Información y estado"
      />
      <div className="admin-content">
        <HeaderPrestador onVolver={handleVolver} />
        {prestador ? (
          <PrestadoresForm prestador={prestador} />
        ) : (
          <p>No se encontró el prestador</p>
        )}
      </div>
    </div>
  );
};

export default PrestadorProfile;
