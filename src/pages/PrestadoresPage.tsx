// PrestadoresPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/genericos/Header";
import PrestadoresHeader from "../components/prestadores/HeaderPrestadores";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaPrestadores from "../components/prestadores/ListaPrestadores";
import Paginacion from "../components/genericos/Paginacion";
import "../components/genericos/PaginaEstilos.css";
import mockPrestadores from "../../data/prestadores-mock-backend.json"
import type { Prestador } from "../types/prestadores";


const PrestadoresPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [prestadores] = useState<Prestador[] >(mockPrestadores);

  const navigate = useNavigate();

  // Función que se pasa al botón "Volver al menú"
  const handleVolver = () => {
    navigate("/"); // redirige al Dashboard
  };

  // Función para dar de alta prestador
  const handleAlta = () => {
    console.log("Dar de alta prestador");
    // Aquí iría la lógica para abrir modal o navegar a formulario
  };

  return (
    <div className="admin-page">
      <Header 
        title="Panel de Administración" 
        subtitle="Prestadores - Administración de prestadores médicos y especialistas"
      />

      <div className="admin-content">
        {/* Header de sección con botones */}
        <PrestadoresHeader onVolver={handleVolver} onAlta={handleAlta} />

        {/* Barra de búsqueda */}
        <BarraBusqueda busqueda={busqueda} setBusqueda={setBusqueda} />

        {/* Lista de prestadores */}
        <ListaPrestadores prestadores={prestadores} />

        {/* Paginación */}
        <Paginacion totalPages={5} />
      </div>
    </div>
  );
};

export default PrestadoresPage;