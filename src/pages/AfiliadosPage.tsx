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
import type { Afiliado } from "../types/afiliados";

const AfiliadosPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar si los datos fueron pasados desde el Dashboard
    const afiliadosFromState = location.state?.afiliados;
    
    if (afiliadosFromState) {
      // Si los datos vienen del Dashboard, usarlos como cache
      setAfiliados(afiliadosFromState);
      setLoading(false);
    } else {
      // Si no hay datos del Dashboard, consultar el backend
      const fetchAfiliados = async () => {
        try {
          setLoading(true);
          const response = await fetch("http://localhost:3000/afiliados");
          if (!response.ok) {
            throw new Error("Error al obtener la lista de afiliados");
          }
          const data: Afiliado[] = await response.json();
          setAfiliados(data);
        } catch (error) {
          console.error(error);
          setAfiliados([]);
        } finally {
          setLoading(false);
        }
      };

      fetchAfiliados();
    }
  }, [location.state]);

  // Función que se pasa al botón "Volver al menú"
  const handleVolver = () => {
    navigate("/"); // redirige al Dashboard
  };

  // Función para dar de alta afiliado
  const handleAlta = () => {
    navigate("/afiliados/alta"); // redirige a la página de alta
  };

  // Filtrado por búsqueda
  const afiliadosFiltrados = filtrarPorBusqueda(afiliados, busqueda);

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
