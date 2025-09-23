// AfiliadosPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/genericos/Header";
import BarraBusqueda from "../components/genericos/BarraBusqueda";
import ListaAfiliados from "../components/afiliados/ListaAfiliados";
import Paginacion from "../components/genericos/Paginacion";
import AfiliadosHeader from "../components/afiliados/HeaderAfiliados";
import "../components/genericos/PaginaEstilos.css";

export interface Afiliado {
  id: number;
  credencial: string;
  plan: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  mail: string;
  desde: string;
  hasta: string;
  fechaBaja?: string;
}

const AfiliadosPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState("");

  const [afiliados] = useState<Afiliado[]>([
    {
      id: 1,
      credencial: "1234567-01",
      plan: "Plan Premium",
      tipoDocumento: "DNI",
      numeroDocumento: "40123456",
      nombre: "Adrián Alejandro",
      apellido: "González Arévalo",
      fechaNacimiento: "1988-03-22",
      telefono: "11-5555-1111",
      direccion: "Av. Corrientes 1234, CABA",
      mail: "adrian.gonzalez@mail.com",
      desde: "2019-06-01",
      hasta: "2025-06-01",
      fechaBaja: "",
    },
    {
      id: 2,
      credencial: "7654321-02",
      plan: "Plan Básico",
      tipoDocumento: "DNI",
      numeroDocumento: "38999888",
      nombre: "Lucia Noemi",
      apellido: "Morelos Fernandez",
      fechaNacimiento: "1992-11-10",
      telefono: "11-5555-2222",
      direccion: "Calle Falsa 456, Buenos Aires",
      mail: "lucia.morelos@mail.com",
      desde: "2020-02-15",
      hasta: "2026-02-15",
      fechaBaja: "",
    },
    {
      id: 3,
      credencial: "9998887-03",
      plan: "Plan Familiar",
      tipoDocumento: "DNI",
      numeroDocumento: "37777111",
      nombre: "Carlos",
      apellido: "Pereyra",
      fechaNacimiento: "1985-07-08",
      telefono: "11-5555-3333",
      direccion: "San Martín 789, La Plata",
      mail: "carlos.pereyra@mail.com",
      desde: "2018-01-01",
      hasta: "2024-01-01",
      fechaBaja: "2023-12-31",
    },
    {
      id: 4,
      credencial: "1112223-04",
      plan: "Plan Premium",
      tipoDocumento: "DNI",
      numeroDocumento: "36666123",
      nombre: "Antony",
      apellido: "Rashford",
      fechaNacimiento: "1995-09-14",
      telefono: "11-5555-4444",
      direccion: "Belgrano 321, Rosario",
      mail: "antony.rashford@mail.com",
      desde: "2021-03-01",
      hasta: "2027-03-01",
      fechaBaja: "",
    },
  ]);

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
        <AfiliadosHeader onVolver={handleVolver} />

        <BarraBusqueda busqueda={busqueda} setBusqueda={setBusqueda} />

        {/* Aquí pasamos navigate a ListaAfiliados */}
        <ListaAfiliados afiliados={afiliados} navigate={navigate} />

        <Paginacion totalPages={9} />
      </div>
    </div>
  );
};

export default AfiliadosPage;
