// PrestadoresPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/genericos/Header";
import PrestadoresHeader from "../components/prestadores/HeaderPrestadores";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaPrestadores from "../components/prestadores/ListaPrestadores";
import Paginacion from "../components/genericos/Paginacion";
import "../components/genericos/PaginaEstilos.css";
import type { Prestador } from "../types/prestadores";
import { getApiUrl } from "../config/env";

const PrestadoresPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros para prestadores
  const [searchByNombre, setSearchByNombre] = useState(true);
  const [searchByCuil, setSearchByCuil] = useState(false);
  const [searchByEspecialidad, setSearchByEspecialidad] = useState(false);
  const [searchByLocalidad, setSearchByLocalidad] = useState(false);
  const [onlyProfesionales, setOnlyProfesionales] = useState(false);
  const [onlyCentros, setOnlyCentros] = useState(false);
  const [includeBajas, setIncludeBajas] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const prestadoresPerPage = 6;

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

  // Función auxiliar para verificar si un prestador está activo
  const estaActivo = (prestador: Prestador): boolean => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Si tiene fecha de baja y ya pasó, está inactivo
    if (prestador.fechaBaja) {
      const fechaBaja = new Date(prestador.fechaBaja);
      fechaBaja.setHours(0, 0, 0, 0);
      if (fechaBaja <= hoy) return false;
    }

    // Si tiene fecha de alta futura, está inactivo
    if (prestador.fechaAlta) {
      const fechaAlta = new Date(prestador.fechaAlta);
      fechaAlta.setHours(0, 0, 0, 0);
      if (fechaAlta > hoy) return false;
    }

    return true;
  };

  // Filtrado de prestadores
  const prestadoresFiltrados = prestadores.filter((prestador) => {
    // Filtro por tipo de prestador
    if (onlyProfesionales && !prestador.esProfesionalIndependiente) return false;
    if (onlyCentros && prestador.esProfesionalIndependiente) return false;

    // Filtro por estado (bajas) - CORREGIDO
    // Solo excluir si NO se incluyen bajas Y el prestador está realmente inactivo
    if (!includeBajas && !estaActivo(prestador)) return false;

    // Si no hay búsqueda, mostrar todos los que pasaron los filtros anteriores
    if (!busqueda.trim()) return true;

    const searchLower = busqueda.toLowerCase().trim();

    // Si no hay ningún filtro de búsqueda activo, buscar en todos los campos
    const noHayFiltrosActivos = !searchByNombre && !searchByCuil && !searchByEspecialidad && !searchByLocalidad;

    if (noHayFiltrosActivos) {
      // Buscar en todos los campos
      return (
        prestador.nombreCompleto.toLowerCase().includes(searchLower) ||
        prestador.numeroCUIL.includes(searchLower) ||
        prestador.especialidades?.some(esp => esp.nombre.toLowerCase().includes(searchLower)) ||
        prestador.direccion?.some(dir => dir.localidad.toLowerCase().includes(searchLower))
      );
    }

    // Si hay filtros activos, aplicarlos
    let matchFound = false;

    if (searchByNombre && prestador.nombreCompleto.toLowerCase().includes(searchLower)) {
      matchFound = true;
    }

    if (searchByCuil && prestador.numeroCUIL.includes(searchLower)) {
      matchFound = true;
    }

    if (searchByEspecialidad && prestador.especialidades?.some(esp => 
      esp.nombre.toLowerCase().includes(searchLower)
    )) {
      matchFound = true;
    }

    if (searchByLocalidad && prestador.direccion?.some(dir => 
      dir.localidad.toLowerCase().includes(searchLower)
    )) {
      matchFound = true;
    }

    return matchFound;
  });

  // Calcular total de páginas
  const totalPages = Math.ceil(prestadoresFiltrados.length / prestadoresPerPage) || 1;

  // Ajustar currentPage si queda fuera de rango
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Reiniciar página al cambiar búsqueda o filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, searchByNombre, searchByCuil, searchByEspecialidad, searchByLocalidad, onlyProfesionales, onlyCentros, includeBajas]);

  const startIndex = (currentPage - 1) * prestadoresPerPage;
  const prestadoresVisibles = prestadoresFiltrados.slice(startIndex, startIndex + prestadoresPerPage);

  return (
    <div className="admin-page">
      <Header
        title="MedIntegral - Panel de Administración"
        subtitle="Prestadores - Administración de prestadores médicos y especialistas"
      />

      <div className="admin-content">
        <PrestadoresHeader onVolver={handleVolver} onAlta={handleAlta} mostrarAlta={true} />

        <BarraBusqueda
          mode="prestadores"
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          searchByNombre={searchByNombre}
          setSearchByNombre={setSearchByNombre}
          searchByCuil={searchByCuil}
          setSearchByCuil={setSearchByCuil}
          searchByEspecialidad={searchByEspecialidad}
          setSearchByEspecialidad={setSearchByEspecialidad}
          searchByLocalidad={searchByLocalidad}
          setSearchByLocalidad={setSearchByLocalidad}
          onlyProfesionales={onlyProfesionales}
          setOnlyProfesionales={setOnlyProfesionales}
          onlyCentros={onlyCentros}
          setOnlyCentros={setOnlyCentros}
          includeBajas={includeBajas}
          setIncludeBajas={setIncludeBajas}
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