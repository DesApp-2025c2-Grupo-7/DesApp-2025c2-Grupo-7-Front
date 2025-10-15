import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../components/genericos/Header";
import HeaderAfiliado from "../components/afiliados/HeaderAfiliados";
import AfiliadosForm from "../components/afiliados/AfiliadosForm";
import "./AfiliadoProfile.css"; 
import type {Persona,Integrante, Afiliado,GrupoFamiliar } from "../types/afiliados";
const AfiliadoProfile: React.FC = () => {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null); // Titular original (para referencia del grupo)
  const [afiliadoMostrado, setAfiliadoMostrado] = useState<Afiliado | null>(null); // El afiliado que se muestra (puede ser titular o integrante)
  const [grupoFamiliar, setGrupoFamiliar] = useState<GrupoFamiliar | null>(null);
  const [miembrosGrupo, setMiembrosGrupo] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!id) return;

    const fetchAfiliado = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/personas/${id}`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos del afiliado");
        }
        const data: Afiliado = await response.json();
        setAfiliado(data);

        // Crear el grupo familiar completo incluyendo al titular y sus integrantes
        const grupoData: GrupoFamiliar = {
          id: data.id,
          planMedico: data.planMedico,
          fechaCreacion: data.fechaAlta,
          fechaAltaPlan: data.fechaAlta,
          activo: true
        };
        setGrupoFamiliar(grupoData);
        
        // Crear la lista completa del grupo familiar: titular + integrantes
        const grupoCompleto: Afiliado[] = [
          // Primero el titular (afiliado actual)
          {
            ...data,
            grupoFamiliar: [] // Evitar recursión
          }
        ];
        
        // Agregar los integrantes si existen
        if (data.grupoFamiliar && data.grupoFamiliar.length > 0) {
          const integrantes: Afiliado[] = data.grupoFamiliar.map(integrante => ({
            ...integrante,
            grupoFamiliar: []
          }));
          grupoCompleto.push(...integrantes);
        }
        
        setMiembrosGrupo(grupoCompleto);
        
        // Determinar qué afiliado mostrar basado en el parámetro de URL
        const integranteId = searchParams.get('integrante');
        
        if (integranteId) {
          // Si hay parámetro integrante, buscar ese integrante en el grupo por credencial-sufijo
          const integranteEncontrado = grupoCompleto.find(miembro => `${miembro.credencial}-${miembro.sufijo}` === integranteId);
          if (integranteEncontrado) {
            setAfiliadoMostrado(integranteEncontrado);
          } else {
            setAfiliadoMostrado(data); // Fallback al titular si no se encuentra el integrante
          }
        } else {
          // Si no hay parámetro, mostrar el titular
          setAfiliadoMostrado(data);
        }
      } catch (error) {
        console.error(error);
        setAfiliado(null);
        setAfiliadoMostrado(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAfiliado();
  }, [id, searchParams.toString()]);

  const handleVolver = () => navigate("/afiliados");

  const handleDarDeBaja = async () => {
    if (afiliadoMostrado) {
      const fechaBaja = new Date().toISOString().split("T")[0];
      try {

        await fetch(`http://localhost:3000/afiliados/${afiliadoMostrado.id}/baja`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fechaBaja }),
        });

        setAfiliadoMostrado({ ...afiliadoMostrado, fechaBaja });
        alert("El Afiliado será dado de baja en la fecha " + fechaBaja + " 🚫");
      } catch (error) {
        console.error("Error al dar de baja:", error);
        alert("No se pudo dar de baja al afiliado ❌");
      }
    }
  };


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


  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Afiliado - Información personal y estado"
      />
      <div className="admin-content">
        <HeaderAfiliado onVolver={handleVolver} />
        {afiliadoMostrado && afiliado ? (
          <AfiliadosForm 
            afiliado={afiliadoMostrado} 
            afiliadoTitular={afiliado}
            grupoFamiliar={grupoFamiliar}
            miembrosGrupo={miembrosGrupo}
            onDarDeBaja={handleDarDeBaja} 
          />
        ) : (
          <p>No se encontró el afiliado</p>
        )}
      </div>
    </div>
  );
};

export default AfiliadoProfile;
