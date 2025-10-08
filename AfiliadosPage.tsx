// AfiliadosPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/genericos/Header";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaAfiliados from "../components/afiliados/ListaAfiliados";
import Paginacion from "../components/genericos/Paginacion";
import AfiliadosHeader from "../components/afiliados/HeaderAfiliados";
import "../components/genericos/PaginaEstilos.css";
import type { Afiliado } from "../types/afiliados";

const AfiliadosPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);

  // 👇 Nuevo estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const afiliadosPerPage = 3;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAfiliados = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/afiliados");
        if (!response.ok) throw new Error("Error al obtener la lista de afiliados");
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
  }, []);

  const handleVolver = () => navigate("/");

  // Filtrar por búsqueda
  const afiliadosFiltrados = afiliados.filter((a) =>
    `${a.nombre} ${a.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 👇 Lógica de paginación
  const totalPages = Math.ceil(afiliadosFiltrados.length / afiliadosPerPage);
  const startIndex = (currentPage - 1) * afiliadosPerPage;
  const afiliadosVisibles = afiliadosFiltrados.slice(startIndex, startIndex + afiliadosPerPage);

  // Si cambian los resultados de búsqueda, volver a la página 1
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
        <AfiliadosHeader onVolver={handleVolver} />
        <BarraBusqueda busqueda={busqueda} setBusqueda={setBusqueda} />

        {loading ? (
          <p>Cargando afiliados...</p>
        ) : afiliadosVisibles.length > 0 ? (
          <>
            <ListaAfiliados afiliados={afiliadosVisibles} />
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
