// PrestadoresPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/genericos/Header";
import PrestadoresHeader from "../components/prestadores/HeaderPrestadores";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaPrestadores from "../components/prestadores/ListaPrestadores";
import Paginacion from "../components/genericos/Paginacion";
import TabsPrestadores from "../components/prestadores/TabsPrestadores";
import SubTabsReportesPrestadores from "../components/prestadores/reportes/SubTabReportesPrestadores";
import ReporteAltasPorPeriodo from "../components/prestadores/reportes/ReporteAltasPeriodo";
import ReportePrestadoresPorEspecialidad from "../components/prestadores/reportes/ReportePrestadoresPorEspecialidad";

import "../components/genericos/PaginaEstilos.css";
import type { Prestador } from "../types/prestadores";
import { getApiUrl } from "../config/env";

const PrestadoresPage: React.FC = () => {
  // Tabs principales
  const [activeTab, setActiveTab] = useState<"lista" | "reportes">("lista");
  const [activeSubTab, setActiveSubTab] = useState<"especialidades" | "altasPeriodo">("especialidades");

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [searchByNombre, setSearchByNombre] = useState(true);
  const [searchByCuil, setSearchByCuil] = useState(false);
  const [searchByEspecialidad, setSearchByEspecialidad] = useState(false);
  const [searchByLocalidad, setSearchByLocalidad] = useState(false);
  const [onlyProfesionales, setOnlyProfesionales] = useState(false);
  const [onlyCentros, setOnlyCentros] = useState(false);
  const [includeBajas, setIncludeBajas] = useState(false);

  const [prestadores, setPrestadores] = useState<Prestador[]>([]);
  const [loading, setLoading] = useState(true);

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
          if (!response.ok) throw new Error("Error al obtener los prestadores");
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

  const estaActivo = (prestador: Prestador): boolean => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (prestador.fechaBaja) {
      const fechaBaja = new Date(prestador.fechaBaja);
      fechaBaja.setHours(0, 0, 0, 0);
      if (fechaBaja <= hoy) return false;
    }

    if (prestador.fechaAlta) {
      const fechaAlta = new Date(prestador.fechaAlta);
      fechaAlta.setHours(0, 0, 0, 0);
      if (fechaAlta > hoy) return false;
    }

    return true;
  };

  const prestadoresFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return prestadores.filter((p) => {
      if (onlyProfesionales && !p.esProfesionalIndependiente) return false;
      if (onlyCentros && p.esProfesionalIndependiente) return false;
      if (!includeBajas && !estaActivo(p)) return false;
      if (!q) return true;

      const matches: boolean[] = [];
      if (searchByNombre && p.nombreCompleto.toLowerCase().includes(q)) matches.push(true);
      if (searchByCuil && p.numeroCUIL.includes(q)) matches.push(true);
      if (searchByEspecialidad && p.especialidades?.some(e => e.nombre.toLowerCase().includes(q))) matches.push(true);
      if (searchByLocalidad && p.direccion?.some(d => d.localidad.toLowerCase().includes(q))) matches.push(true);

      return matches.length === 0 ? false : matches.some(Boolean);
    });
  }, [
    prestadores,
    busqueda,
    searchByNombre,
    searchByCuil,
    searchByEspecialidad,
    searchByLocalidad,
    onlyProfesionales,
    onlyCentros,
    includeBajas,
  ]);

  const totalPages = Math.ceil(prestadoresFiltrados.length / prestadoresPerPage) || 1;
  const startIndex = (currentPage - 1) * prestadoresPerPage;
  const prestadoresVisibles = prestadoresFiltrados.slice(startIndex, startIndex + prestadoresPerPage);

  useEffect(() => { setCurrentPage(1); }, [
    busqueda,
    searchByNombre,
    searchByCuil,
    searchByEspecialidad,
    searchByLocalidad,
    onlyProfesionales,
    onlyCentros,
    includeBajas
  ]);

  return (
    <div className="admin-page">
      <Header
        title="MedIntegral - Panel de Administración"
        subtitle="Prestadores - Administración de prestadores médicos y especialistas"
      />

      <div className="admin-content">
        <PrestadoresHeader onVolver={handleVolver} onAlta={handleAlta} mostrarAlta={true} />

        {/* Tabs principales */}
        <TabsPrestadores activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "lista" ? (
          <>
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
          </>
        ) : (
          <>
            {/* SubTabs para reportes */}
            <SubTabsReportesPrestadores
              activeSubTab={activeSubTab}
              onSubTabChange={setActiveSubTab}
            />

            {activeSubTab === "especialidades" ? (
              <ReportePrestadoresPorEspecialidad prestadores={prestadoresFiltrados} />
            ) : (
              <ReporteAltasPorPeriodo />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PrestadoresPage;
