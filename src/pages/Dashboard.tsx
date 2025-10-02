import React, { useState, useEffect } from "react";
import "./PageEstilos.css";
import Header from "../components/genericos/Header";
import CardDashboard from "../components/genericos/CardDashboard";
import { Users, UserCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/genericos/PageHeader";
import type { Afiliado } from "../types/afiliados";
import type { Prestador } from "../types/prestadores";


const Dashboard: React.FC = () => {
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Consultar afiliados y prestadores en paralelo
        const [afiliadosResponse, prestadoresResponse] = await Promise.all([
          fetch("http://localhost:3000/afiliados"),
          fetch("http://localhost:3000/prestadores")
        ]);

        if (!afiliadosResponse.ok) {
          throw new Error("Error al obtener afiliados");
        }
        if (!prestadoresResponse.ok) {
          throw new Error("Error al obtener prestadores");
        }

        const afiliadosData: Afiliado[] = await afiliadosResponse.json();
        const prestadoresData: Prestador[] = await prestadoresResponse.json();

        setAfiliados(afiliadosData);
        setPrestadores(prestadoresData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setAfiliados([]);
        setPrestadores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-page">
      {/* Header superior */}
      <Header 
        title="Panel de Administración" 
        subtitle="Medicina Prepaga - Administración de prestadores médicos y centros de salud"
      />

      <div className="admin-content">

        {/* Encabezado de página */}
        <PageHeader title="Dashboard" subtitle="Menú principal" />

        <div className="dashboard-cards">
          <CardDashboard
            title="Afiliados Activos"
            buttonText="+ Ver Afiliados"
            number={loading ? 0 : afiliados.length}
            onButtonClick={() => navigate("/afiliados", { state: { afiliados } })}
            icon={Users}
          />
          <CardDashboard
            title="Prestadores Activos"
            buttonText="+ Ver Prestadores"
            number={loading ? 0 : prestadores.length}
            onButtonClick={() => navigate("/prestadores", { state: { prestadores } })}
            icon={UserCheck}
          />
          <CardDashboard
            title="Horarios de atención"
            buttonText="+ Ver Horarios de Atención"
            number={50}
            onButtonClick={() => console.log("Ver Horarios")}
            icon={Clock}
            />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
