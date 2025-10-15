// AfiliadosPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/genericos/Header";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaAfiliados from "../components/afiliados/ListaAfiliados";
import Paginacion from "../components/genericos/Paginacion";
import AfiliadosHeader from "../components/afiliados/HeaderAfiliados";
import "../components/genericos/PaginaEstilos.css";
import { filtrarPorBusqueda } from "../utils/filtroBusqueda";
import { transformarAfiliadosParaLista } from "../utils/transformarAfiliados";
import type { Afiliado, AfiliadoListItem } from "../types/afiliados";
import { getApiUrl } from "../config/env";

const AfiliadosPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]); // Mantiene datos originales para navegación
  const [afiliadosLista, setAfiliadosLista] = useState<AfiliadoListItem[]>([]); // Datos transformados para la lista
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar si los datos fueron pasados desde el Dashboard
    const afiliadosFromState = location.state?.afiliados;
    
    if (afiliadosFromState) {
      // Si los datos vienen del Dashboard, usarlos como cache
      setAfiliados(afiliadosFromState);
      const listaTransformada = transformarAfiliadosParaLista(afiliadosFromState);
      setAfiliadosLista(listaTransformada);
      setLoading(false);
    } else {
      // Si no hay datos del Dashboard, consultar el backend
      const fetchAfiliados = async () => {
        try {
          setLoading(true);
          // Obtener solo los titulares (AFILIADO) desde el backend
          const response = await fetch(getApiUrl("/personas"));
          if (!response.ok) {
            throw new Error("Error al obtener la lista de afiliados");
          }
          const titulares: Afiliado[] = await response.json();
          
          // Para cada titular, obtener su grupo familiar completo
          const afiliadosCompletos = await Promise.all(
            titulares.map(async (titular) => {
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
          // Transformar para mostrar TODOS los afiliados e integrantes en la lista
          const listaTransformada = transformarAfiliadosParaLista(afiliadosCompletos);
          setAfiliadosLista(listaTransformada);
        } catch (error) {
          console.error("Error al cargar afiliados:", error);
          setAfiliados([]);
          setAfiliadosLista([]);
        } finally {
          setLoading(false);
        }
      };

      fetchAfiliados();
    }
  }, [location.state]);

  // Función que se pasa al botón "Volver al menú"
  const handleVolver = () => {
    navigate("/", { state: { afiliados } }); // Pasa datos completos al Dashboard
  };

  // Función para dar de alta afiliado
  const handleAlta = () => {
    navigate("/afiliados/alta"); // redirige a la página de alta
  };

  // Filtrado por búsqueda
  const afiliadosFiltrados = filtrarPorBusqueda(afiliadosLista, busqueda);

  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Afiliados - Administración de prestadores médicos y centros de salud"
      />

      <div className="admin-content">
        <AfiliadosHeader onVolver={handleVolver} onAlta={handleAlta} />

        {/* Barra de búsqueda */}
        <BarraBusqueda busqueda={busqueda} setBusqueda={setBusqueda} />

        {/* Lista de afiliados */}
        {loading ? (
          <p>Cargando afiliados...</p>
        ) : afiliadosFiltrados.length > 0 ? (
          <ListaAfiliados afiliados={afiliadosFiltrados} />
        ) : (
          <p>No se encontraron afiliados</p>
        )}

        {/* Paginación (esto lo podemos conectar al backend más adelante) */}
        <Paginacion totalPages={9} />
      </div>
    </div>
  );
};

export default AfiliadosPage;
