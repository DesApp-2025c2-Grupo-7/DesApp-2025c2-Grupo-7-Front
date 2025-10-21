import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/genericos/Header";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaAfiliados from "../components/afiliados/ListaAfiliados";
import Paginacion from "../components/genericos/Paginacion";
import AfiliadosHeader from "../components/afiliados/HeaderAfiliados";
import "../components/genericos/PaginaEstilos.css";
import { transformarAfiliadosParaLista } from "../utils/transformarAfiliados";
import type { Afiliado, AfiliadoListItem } from "../types/afiliados";
import { getApiUrl } from "../config/env";

const CACHE_KEY = "afiliados_cache";
const CACHE_DURATION_HOURS = 0.02; // ~3 minutos

const AfiliadosPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [searchByNombre, setSearchByNombre] = useState(true);
  const [searchByApellido, setSearchByApellido] = useState(true);
  const [searchByCredencial, setSearchByCredencial] = useState(false);
  const [searchByDni, setSearchByDni] = useState(true);
  const [onlyTitulares, setOnlyTitulares] = useState(false);
  const [includeInactivos, setIncludeInactivos] = useState(false);
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [afiliadosLista, setAfiliadosLista] = useState<AfiliadoListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const afiliadosPerPage = 5;

  const navigate = useNavigate();
  const location = useLocation();

  // 🧠 Restaurar filtros desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem("afiliados_filters");
    if (saved) {
      try {
        const filters = JSON.parse(saved);
        if (filters.busqueda) setBusqueda(filters.busqueda);
        if (typeof filters.searchByNombre === "boolean")
          setSearchByNombre(filters.searchByNombre);
        if (typeof filters.searchByApellido === "boolean")
          setSearchByApellido(filters.searchByApellido);
        if (typeof filters.searchByCredencial === "boolean")
          setSearchByCredencial(filters.searchByCredencial);
        if (typeof filters.searchByDni === "boolean")
          setSearchByDni(filters.searchByDni);
        if (typeof filters.onlyTitulares === "boolean")
          setOnlyTitulares(filters.onlyTitulares);
        if (typeof filters.includeInactivos === "boolean")
          setIncludeInactivos(filters.includeInactivos);
      } catch (err) {
        console.warn("Error leyendo filtros de afiliados:", err);
      }
    }
  }, []);

  // 💾 Guardar filtros en localStorage cada vez que cambien
  useEffect(() => {
    const filters = {
      busqueda,
      searchByNombre,
      searchByApellido,
      searchByCredencial,
      searchByDni,
      onlyTitulares,
      includeInactivos,
    };
    localStorage.setItem("afiliados_filters", JSON.stringify(filters));
  }, [
    busqueda,
    searchByNombre,
    searchByApellido,
    searchByCredencial,
    searchByDni,
    onlyTitulares,
    includeInactivos,
  ]);

  useEffect(() => {
    const afiliadosFromState = location.state?.afiliados;

    if (afiliadosFromState) {
      setAfiliados(afiliadosFromState);
      const listaTransformada =
        transformarAfiliadosParaLista(afiliadosFromState);
      setAfiliadosLista(listaTransformada);
      setLoading(false);
    } else {
      const fetchAfiliados = async () => {
        try {
          setLoading(true);

          // 🧩 Intentar usar cache
          const cacheStr = localStorage.getItem(CACHE_KEY);
          if (cacheStr) {
            const cache = JSON.parse(cacheStr);
            const ageHours = (Date.now() - cache.timestamp) / (1000 * 60 * 60);
            if (ageHours < CACHE_DURATION_HOURS) {
              setAfiliados(cache.afiliados);
              setAfiliadosLista(cache.afiliadosLista);
              setLoading(false);
              return;
            }
          }

          const response = await fetch(getApiUrl("/personas"));
          if (!response.ok) {
            throw new Error("Error al obtener la lista de afiliados");
          }
          const titulares: Afiliado[] = await response.json();

          const afiliadosCompletos = await Promise.all(
            titulares.map(async (titular) => {
              try {
                const grupoResponse = await fetch(
                  getApiUrl(`/personas/grupo/${titular.credencial}`)
                );
                if (grupoResponse.ok) {
                  const grupoCompleto = await grupoResponse.json();
                  return {
                    ...titular,
                    grupoFamiliar: grupoCompleto.grupoFamiliar || [],
                  };
                }
                return { ...titular, grupoFamiliar: [] };
              } catch (error) {
                console.warn(
                  `Error obteniendo grupo de ${titular.credencial}:`,
                  error
                );
                return { ...titular, grupoFamiliar: [] };
              }
            })
          );

          setAfiliados(afiliadosCompletos);
          const listaTransformada =
            transformarAfiliadosParaLista(afiliadosCompletos);
          setAfiliadosLista(listaTransformada);

          // 💾 Guardar cache
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              afiliados: afiliadosCompletos,
              afiliadosLista: listaTransformada,
            })
          );
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

  const handleVolver = () => {
    navigate("/", { state: { afiliados } });
  };

  const handleAlta = () => {
    navigate("/afiliados/alta");
  };

  const afiliadosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const today = new Date().toISOString().split("T")[0];

    return (afiliadosLista || []).filter((a) => {
      const isActive = !a.fechaBaja || a.fechaBaja > today;
      if (!includeInactivos && !isActive) return false;
      if (onlyTitulares && !a.esTitular) return false;
      if (!q) return true;

      const matches: boolean[] = [];
      if (searchByNombre && a.nombre)
        matches.push(String(a.nombre).toLowerCase().includes(q));
      if (searchByApellido && a.apellido)
        matches.push(String(a.apellido).toLowerCase().includes(q));
      if (searchByCredencial) {
        const cred = `${a.credencial || ""}`.toLowerCase();
        const suf = `${a.sufijo || ""}`.toLowerCase();
        const full = `${cred}-${suf}`.toLowerCase();
        matches.push(cred.includes(q) || suf.includes(q) || full.includes(q));
      }
      if (searchByDni && a.numeroDocumento) {
        matches.push(String(a.numeroDocumento).toLowerCase().includes(q));
      }

      if (matches.length === 0) return false;
      return matches.some(Boolean);
    });
  }, [
    afiliadosLista,
    busqueda,
    searchByNombre,
    searchByApellido,
    searchByCredencial,
    searchByDni,
    onlyTitulares,
    includeInactivos,
  ]);

  const totalPages = Math.ceil(afiliadosFiltrados.length / afiliadosPerPage);
  const startIndex = (currentPage - 1) * afiliadosPerPage;
  const afiliadosVisibles = afiliadosFiltrados.slice(
    startIndex,
    startIndex + afiliadosPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Afiliados - Administración de prestadores médicos y centros de salud"
      />

      <div className="admin-content">
        <AfiliadosHeader
          onVolver={handleVolver}
          onAlta={handleAlta}
          afiliadoButtonText="Dar de alta afiliado"
        />

        <BarraBusqueda
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          searchByNombre={searchByNombre}
          setSearchByNombre={setSearchByNombre}
          searchByApellido={searchByApellido}
          setSearchByApellido={setSearchByApellido}
          searchByCredencial={searchByCredencial}
          setSearchByCredencial={setSearchByCredencial}
          searchByDni={searchByDni}
          setSearchByDni={setSearchByDni}
          onlyTitulares={onlyTitulares}
          setOnlyTitulares={setOnlyTitulares}
          includeInactivos={includeInactivos}
          setIncludeInactivos={setIncludeInactivos}
        />

        {loading ? (
          <p>Cargando afiliados...</p>
        ) : afiliadosVisibles.length > 0 ? (
          <>
            <ListaAfiliados
              afiliados={afiliadosVisibles}
              totalAfiliados={afiliadosFiltrados.length}
            />
            <Paginacion
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <p>No se encontraron afiliados</p>
        )}
      </div>
    </div>
  );
};

export default AfiliadosPage;
