// AfiliadosPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/genericos/Header";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaAfiliados from "../components/afiliados/ListaAfiliados";
import Paginacion from "../components/genericos/Paginacion";
import AfiliadosHeader from "../components/afiliados/HeaderAfiliados";
import "../components/genericos/PaginaEstilos.css";
import mockData from "../../data/afiliados-mock-backend.json"
import type { Afiliado } from "../types/afiliados";


const AfiliadosPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [afiliados] = useState<Afiliado[]>(mockData);

  const navigate = useNavigate();

  // Función que se pasa al botón "Volver al menú"
  const handleVolver = () => {
    navigate("/"); // redirige al Dashboard
  };

  return (
    <div className="admin-page">
      <Header 
        title="Panel de Administración" 
        subtitle="Afiliados - Administración de prestadores médicos y centros de salud"
      />

      <div className="admin-content">
        {/* Ejemplo de todos los tipos de botones */}
        <AfiliadosHeader onVolver={handleVolver} />

        {/* Barra de búsqueda */}
        <BarraBusqueda busqueda={busqueda} setBusqueda={setBusqueda} />

        {/* Lista de afiliados */}
        <ListaAfiliados afiliados={afiliados} />

        {/* Paginación */}
        <Paginacion totalPages={9} />
      </div>
    </div>
  );
};

export default AfiliadosPage;
