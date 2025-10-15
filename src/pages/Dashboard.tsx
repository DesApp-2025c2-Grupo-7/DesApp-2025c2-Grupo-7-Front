import React, { useState, useEffect } from "react";
import "./PaginaEstilos.css";
import Header from "../components/genericos/Header";
import CardDashboard from "../components/genericos/CardDashboard";
import { Users, UserCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/genericos/PageHeader";
import type { Afiliado } from "../types/afiliados";
import type { Prestador } from "../types/prestadores";
import { getApiUrl } from "../config/env";


const Dashboard: React.FC = () => {
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Función para calcular el total de personas (titulares + integrantes) evitando duplicados
  const calcularTotalPersonas = () => {
    const personasUnicas = new Set<string>();
    
    afiliados.forEach(afiliado => {
      // Agregar el titular
      const titularKey = `${afiliado.credencial}-${afiliado.sufijo}`;
      personasUnicas.add(titularKey);
      
      // Agregar los integrantes del grupo familiar
      if (afiliado.grupoFamiliar && afiliado.grupoFamiliar.length > 0) {
        afiliado.grupoFamiliar.forEach((integrante: { credencial: any; sufijo: any; }) => {
          const integranteKey = `${integrante.credencial}-${integrante.sufijo}`;
          personasUnicas.add(integranteKey);
        });
      }
    });
    
    return personasUnicas.size;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Consultar afiliados y prestadores en paralelo
        const [afiliadosResponse, prestadoresResponse] = await Promise.all([
          fetch(getApiUrl("/personas")),
          fetch(getApiUrl("/prestadores"))
        ]);

        if (!afiliadosResponse.ok) {
          throw new Error("Error al obtener afiliados");
        }
        if (!prestadoresResponse.ok) {
          throw new Error("Error al obtener prestadores");
        }

        const afiliadosData: Afiliado[] = await afiliadosResponse.json();
        const prestadoresData: Prestador[] = await prestadoresResponse.json();

        // Para cada titular, obtener su grupo familiar completo
        const afiliadosCompletos = await Promise.all(
          afiliadosData.map(async (titular) => {
            try {
              const grupoResponse = await fetch(getApiUrl(`/personas/grupo/${titular.credencial}`));
              if (grupoResponse.ok) {
                const grupoCompleto = await grupoResponse.json();
                return {
                  ...titular,
                  grupoFamiliar: grupoCompleto.grupoFamiliar || []
                };
              }
              return {
                ...titular,
                grupoFamiliar: []
              };
            } catch (error) {
              console.warn(`Error obteniendo grupo de ${titular.credencial}:`, error);
              return {
                ...titular,
                grupoFamiliar: []
              };
            }
          })
        );

        setAfiliados(afiliadosCompletos);
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
            number={loading ? 0 : calcularTotalPersonas()}
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
