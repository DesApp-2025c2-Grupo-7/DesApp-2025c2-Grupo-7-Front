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

  // 👇 Nuevo estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const prestadoresPerPage = 5; // cantidad de elementos por página

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const prestadoresFromState = location.state?.prestadores;

    if (prestadoresFromState) {
      setPrestadores(prestadoresFromState);
      setLoading(false);
    } else {
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

  // Función para volver al Dashboard
  const handleVolver = () => navigate("/");

  // Función para dar de alta prestador
  const handleAlta = () => navigate("/prestadores/alta");

  // Filtrado por búsqueda
  const prestadoresFiltrados = filtrarPorBusqueda(prestadores, busqueda);

  // 👇 Lógica de paginación
  const totalPages = Math.ceil(prestadoresFiltrados.length / prestadoresPerPage);
  const startIndex = (currentPage - 1) * prestadoresPerPage;
  const prestadoresVisibles = prestadoresFiltrados.slice(startIndex, startIndex + prestadoresPerPage);

  // 👇 Reiniciar a la página 1 si cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Prestadores - Administración de prestadores médicos y especialistas"
      />

      <div className="admin-content">
        <PrestadoresHeader onVolver={handleVolver} onAlta={handleAlta} />

        <BarraBusqueda busqueda={busqueda} setBusqueda={setBusqueda} />

        {loading ? (
          <p>Cargando prestadores...</p>
        ) : prestadoresVisibles.length > 0 ? (
          <>
            <ListaPrestadores prestadores={prestadoresVisibles} />
            <Paginacion
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <p>No se encontraron prestadores</p>
        )}
      </div>
    </div>
  );
};

export default PrestadoresPage;
