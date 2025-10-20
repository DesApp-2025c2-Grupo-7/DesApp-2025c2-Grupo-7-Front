// AfiliadosPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/genericos/Header";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaAfiliados from "../components/afiliados/ListaAfiliados";
import Paginacion from "../components/genericos/Paginacion";
import AfiliadosHeader from "../components/afiliados/HeaderAfiliados";
import "../components/genericos/PaginaEstilos.css";
// search filtering is implemented inline in this page
import { transformarAfiliadosParaLista } from "../utils/transformarAfiliados";
import type { Afiliado, AfiliadoListItem } from "../types/afiliados";
import { getApiUrl } from "../config/env";

const AfiliadosPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  // filtros que se pasan a la barra de búsqueda
  const [searchByNombre, setSearchByNombre] = useState(true);
  const [searchByApellido, setSearchByApellido] = useState(true);
  const [searchByCredencial, setSearchByCredencial] = useState(false);
  const [searchByDni, setSearchByDni] = useState(true);
  const [onlyTitulares, setOnlyTitulares] = useState(false);
  const [includeInactivos, setIncludeInactivos] = useState(false);
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [afiliadosLista, setAfiliadosLista] = useState<AfiliadoListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 👇 Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const afiliadosPerPage = 3; // cantidad por página

  const navigate = useNavigate();
  const location = useLocation();

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
                return {
                  ...titular,
                  grupoFamiliar: [],
                };
              } catch (error) {
                console.warn(
                  `Error obteniendo grupo de ${titular.credencial}:`,
                  error
                );
                return {
                  ...titular,
                  grupoFamiliar: [],
                };
              }
            })
          );

          setAfiliados(afiliadosCompletos);
          // Transformar para mostrar TODOS los afiliados e integrantes en la lista
          const listaTransformada =
            transformarAfiliadosParaLista(afiliadosCompletos);
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

  const handleVolver = () => {
    navigate("/", { state: { afiliados } });
  };

  const handleAlta = () => {
    navigate("/afiliados/alta");
  };

  // Filtrado por búsqueda y por checkboxes (centralizado antes de la paginación)
    const afiliadosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    return (afiliadosLista || []).filter((a) => {
      // filtro por activos/inactivos
      const isActive = !a.fechaBaja || a.fechaBaja > today;
      if (!includeInactivos && !isActive) return false;

      // filtro solo titulares
      if (onlyTitulares && !a.esTitular) return false;

      if (!q) return true;

      const matches: boolean[] = [];
      if (searchByNombre && a.nombre) matches.push(String(a.nombre).toLowerCase().includes(q));
      if (searchByApellido && a.apellido) matches.push(String(a.apellido).toLowerCase().includes(q));
      if (searchByCredencial) {
        const cred = `${a.credencial || ''}`.toLowerCase();
        const suf = `${a.sufijo || ''}`.toLowerCase();
        const full = `${cred}-${suf}`.toLowerCase();
        matches.push(cred.includes(q) || suf.includes(q) || full.includes(q));
      }
      if (searchByDni && a.numeroDocumento) {
        matches.push(String(a.numeroDocumento).toLowerCase().includes(q));
      }

      // si no hay campos seleccionados para la búsqueda, no matchea
      if (matches.length === 0) return false;

      return matches.some(Boolean);
    });
  }, [afiliadosLista, busqueda, searchByNombre, searchByApellido, searchByCredencial, searchByDni, onlyTitulares, includeInactivos]);

  // 👇 Lógica de paginación
  const totalPages = Math.ceil(afiliadosFiltrados.length / afiliadosPerPage);
  const startIndex = (currentPage - 1) * afiliadosPerPage;
  const afiliadosVisibles = afiliadosFiltrados.slice(
    startIndex,
    startIndex + afiliadosPerPage
  );

  // 👇 Reiniciar a página 1 si cambia la búsqueda
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
