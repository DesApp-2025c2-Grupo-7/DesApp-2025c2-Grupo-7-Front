// AfiliadosPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import AfiliadosHeader from "../components/AfiliadosHeader";
import BarraBusqueda from "../components/BarraBusqueda";
import ListaAfiliados from "../components/ListaAfiliados";
import Paginacion from "../components/Paginacion";
import "./AfiliadosPage.css";

interface Afiliado {
  id: number;
  nombre: string;
}

const AfiliadosPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [afiliados] = useState<Afiliado[]>([
    { id: 1, nombre: "Adrián Alejandro González Arévalo" },
    { id: 2, nombre: "Lucia Noemi Morelos Fernandez" },
    { id: 3, nombre: "Afiliado 3" },
    { id: 4, nombre: "Antony Rashford " },
  ]);

  const navigate = useNavigate();

  // Función que se pasa al botón "Volver al menú"
  const handleVolver = () => {
    navigate("/"); // redirige al Dashboard
  };

  return (
    <div className="afiliados-page">
      {/* Header superior */}
      <DashboardNavbar />

      <div className="afiliados-content">
        {/* Header de sección con botones */}
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
