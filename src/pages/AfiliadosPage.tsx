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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAfiliados = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/afiliados");
        // 👆 Cambiá esta URL por la de tu backend
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
  }, []);

  // Función que se pasa al botón "Volver al menú"
  const handleVolver = () => {
    navigate("/"); // redirige al Dashboard
  };

  // Filtrado por búsqueda
  const afiliadosFiltrados = afiliados.filter((a) =>
    `${a.nombre} ${a.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Afiliados - Administración de prestadores médicos y centros de salud"
      />

      <div className="admin-content">
        <AfiliadosHeader onVolver={handleVolver} />

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
