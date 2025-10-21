
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/genericos/Header";
import HeaderPrestador from "../components/prestadores/HeaderPrestadores";
import PrestadoresForm from "../components/prestadores/PrestadoresForm";
import "./PrestadorProfile.css";
import type { Prestador } from "../types/prestadores";
import { getApiUrl } from "../config/env";



const PrestadorProfilePage: React.FC = () => {
  const [prestador, setPrestador] = useState<Prestador | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;

    const fetchPrestador = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(`/prestadores/${id}`));
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

  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Prestador - Información y estado"
      />
      <div className="admin-content">
        <HeaderPrestador onVolver={handleVolver} mostrarAlta={false}/>
        <PrestadoresForm prestador={prestador} />
      </div>
      
    </div>
  );
};

export default PrestadorProfilePage;

