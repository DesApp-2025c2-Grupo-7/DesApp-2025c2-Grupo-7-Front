// PrestadoresPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/genericos/Header";
import PrestadoresHeader from "../components/prestadores/HeaderPrestadores";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaPrestadores from "../components/prestadores/ListaPrestadores";
import Paginacion from "../components/genericos/Paginacion";
import "../components/genericos/PaginaEstilos.css";

interface Prestador {
  id: number;
  nombre: string;
  especialidad?: string;
}

const PrestadoresPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");
  const [prestadores] = useState<Prestador[]>([
    { id: 1, nombre: "Dr. Carlos Rodríguez", especialidad: "Cardiología" },
    { id: 2, nombre: "Dra. María Elena Vásquez", especialidad: "Pediatría" },
    { id: 3, nombre: "Dr. Roberto Mendoza", especialidad: "Traumatología" },
    { id: 4, nombre: "Dra. Ana Sofía Torres", especialidad: "Ginecología" },
    { id: 5, nombre: "Dr. Luis Fernando García", especialidad: "Neurología" },
    { id: 6, nombre: "Dra. Carmen López", especialidad: "Dermatología" },
  ]);

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