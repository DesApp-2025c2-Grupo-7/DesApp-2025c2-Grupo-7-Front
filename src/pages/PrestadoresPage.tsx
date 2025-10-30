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
import { getApiUrl } from "../config/env";

const PrestadoresPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const prestadoresPerPage = 10;

  const navigate = useNavigate();
  const location = useLocation();

  // Cargar prestadores
  useEffect(() => {
    const prestadoresFromState = location.state?.prestadores;
    if (prestadoresFromState) {
      setPrestadores(prestadoresFromState);
      setLoading(false);
    } else {
      const fetchPrestadores = async () => {
        try {
          setLoading(true);
          const response = await fetch(getApiUrl("/prestadores"));
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

  const handleVolver = () => navigate("/");
  const handleAlta = () => navigate("/prestadores/alta");

  // Filtrado
  const prestadoresFiltrados = filtrarPorBusqueda(prestadores, busqueda);

  // Calcular total de páginas
  const totalPages = Math.ceil(prestadoresFiltrados.length / prestadoresPerPage) || 1;

  // Ajustar currentPage si queda fuera de rango
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Reiniciar página al cambiar búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  const startIndex = (currentPage - 1) * prestadoresPerPage;
  const prestadoresVisibles = prestadoresFiltrados.slice(startIndex, startIndex + prestadoresPerPage);

  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Prestadores - Administración de prestadores médicos y especialistas"
      />

      <div className="admin-content">
        <PrestadoresHeader onVolver={handleVolver} onAlta={handleAlta} mostrarAlta={true} />

        <BarraBusqueda
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          searchByNombre={false}
          setSearchByNombre={() => {}}
          searchByApellido={false}
          setSearchByApellido={() => {}}
          searchByCredencial={false}
          setSearchByCredencial={() => {}}
          searchByDni={false}
          setSearchByDni={() => {}}
          onlyTitulares={false}
          setOnlyTitulares={() => {}}
          includeInactivos={false}
          setIncludeInactivos={() => {}}
        />

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
