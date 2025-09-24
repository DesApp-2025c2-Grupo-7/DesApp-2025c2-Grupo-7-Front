// AfiliadoProfile.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/genericos/Header";
import HeaderAfiliado from "../components/afiliados/HeaderAfiliados";
import AfiliadosForm from "../components/afiliados/AfiliadosForm";
import "./AfiliadoProfile.css"; 
import mockData from "../../data/afiliados-mock-backend.json"
import type { Afiliado } from "../types/afiliados";


// ---- Componente ----
const AfiliadoProfile: React.FC = () => {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const encontrado = mockData.find((a) => a.id === Number(id));
      if (encontrado) setAfiliado(encontrado);
      setLoading(false);
    }, 1000); // Simula 1 segundo de petición

    return () => clearTimeout(timer);
  }, [id]);

  const handleVolver = () => navigate("/afiliados");

  const handleDarDeBaja = () => {
    if (afiliado) {
      setAfiliado({ ...afiliado, fechaBaja: new Date().toISOString().split("T")[0] });
      alert("El Afiliado sera dado de baja la fecha "+ afiliado.fechaBaja+ " 🚫");
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
        <AfiliadosForm afiliado={afiliado}  onDarDeBaja={handleDarDeBaja}/>
        
      </div>
      
    </div>
  );
};

export default AfiliadoProfile;
