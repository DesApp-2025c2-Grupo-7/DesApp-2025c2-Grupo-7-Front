// AfiliadoProfile.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/genericos/Header";
import HeaderAfiliado from "../components/afiliados/HeaderAfiliados";
import AfiliadosForm from "../components/afiliados/AfiliadosForm";
import "./AfiliadoProfile.css"; 
import type { Afiliado } from "../types/afiliados";

// ---- Componente ----
const AfiliadoProfile: React.FC = () => {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;

    const fetchAfiliado = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/afiliados/${id}`); 
        // 👆 Cambiá esta URL por la ruta de tu backend
        if (!response.ok) {
          throw new Error("Error al obtener los datos del afiliado");
        }
        const data: Afiliado = await response.json();
        setAfiliado(data);
      } catch (error) {
        console.error(error);
        setAfiliado(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAfiliado();
  }, [id]);

  const handleVolver = () => navigate("/afiliados");

  const handleDarDeBaja = async () => {
    if (afiliado) {
      const fechaBaja = new Date().toISOString().split("T")[0];
      try {
        // Llamada al backend para dar de baja (PUT/PATCH/POST según tu API)
        await fetch(`http://localhost:3000/afiliados/${afiliado.id}/baja`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fechaBaja }),
        });

        setAfiliado({ ...afiliado, fechaBaja });
        alert("El Afiliado será dado de baja en la fecha " + fechaBaja + " 🚫");
      } catch (error) {
        console.error("Error al dar de baja:", error);
        alert("No se pudo dar de baja al afiliado ❌");
      }
    }
  };

  // --- Render skeleton mientras carga ---
  if (loading) {
    return (
      <div className="admin-page">
        <Header title="Panel de Administración" subtitle="Afiliado - Información personal y estado" />
        <div className="admin-content">
          <HeaderAfiliado onVolver={handleVolver} />
          <div className="afiliado-form">
            {Array.from({ length: 12 }).map((_, i) => (
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
        subtitle="Afiliado - Información personal y estado"
      />
      <div className="admin-content">
        <HeaderAfiliado onVolver={handleVolver} />
        {afiliado ? (
          <AfiliadosForm afiliado={afiliado} onDarDeBaja={handleDarDeBaja} />
        ) : (
          <p>No se encontró el afiliado</p>
        )}
      </div>
    </div>
  );
};

export default AfiliadoProfile;
