// PrestadoresPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/genericos/Header";
import PrestadoresHeader from "../components/prestadores/HeaderPrestadores";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaPrestadores from "../components/prestadores/ListaPrestadores";
import Paginacion from "../components/genericos/Paginacion";
import "../components/genericos/PaginaEstilos.css";
import { filtrarPorBusqueda } from "../utils/filtroBusqueda";
import type { Prestador } from "../types/prestadores";

const PrestadoresPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar si los datos fueron pasados desde el Dashboard
    const prestadoresFromState = location.state?.prestadores;
    
    if (prestadoresFromState) {
      // Si los datos vienen del Dashboard, usarlos como cache
      setPrestadores(prestadoresFromState);
      setLoading(false);
    } else {
      // Si no hay datos del Dashboard, consultar el backend
      const fetchPrestadores = async () => {
        try {
          setLoading(true);
          const response = await fetch("http://localhost:3000/prestadores");
          if (!response.ok) {
            throw new Error("Error al obtener los prestadores");
          }
          const data: Prestador[] = await response.json();
          setPrestadores(data);
        } catch (error) {
          console.error(error);
          setPrestadores([]);
        } finally {
          setLoading(false);
        }
      };

      fetchPrestadores();
    }
  }, [location.state]);

  // Función que se pasa al botón "Volver al menú"
  const handleVolver = () => {
    navigate("/"); // redirige al Dashboard
  };

  // Función para dar de alta prestador
  const handleAlta = () => {
    navigate("/prestadores/alta"); // redirige a la página de alta
  };

  // Filtrado por búsqueda usando nombreCompleto
  const prestadoresFiltrados = filtrarPorBusqueda(prestadores, busqueda);

  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Prestadores - Administración de prestadores médicos y especialistas"
      />

      <div className="admin-content">
        {/* Header de sección con botones */}
        <PrestadoresHeader onVolver={handleVolver} onAlta={handleAlta} />

        {/* Barra de búsqueda */}
        <BarraBusqueda busqueda={busqueda} setBusqueda={setBusqueda} />

        {/* Lista de prestadores */}
        {loading ? (
          <p>Cargando prestadores...</p>
        ) : prestadoresFiltrados.length > 0 ? (
          <ListaPrestadores prestadores={prestadoresFiltrados} />
        ) : (
          <p>No se encontraron prestadores</p>
        )}

        {/* Paginación (por ahora estática, se puede conectar al backend después) */}
        <Paginacion totalPages={5} />
      </div>
    </div>
  );
};

export default PrestadoresPage;
