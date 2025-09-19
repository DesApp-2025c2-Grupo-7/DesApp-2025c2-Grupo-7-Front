import React from "react";
import "./Dashboard.css";
import DashboardNavbar from "../components/DashboardNavbar";
import PageHeader from "../components/PageHeader";
import CardDashboard from "../components/CardDashboard";
import LogoAfiliadosActivos from "../assets/icons/logo-AfiliadosActivos.svg";
import LogoHorariosAtencion from "../assets/icons/logo-HorariosAtencion.svg";
import LogoPrestadoresActivos from "../assets/icons/logo-PrestadoresActivos.svg";
import { useNavigate } from "react-router-dom";


const Dashboard: React.FC = () => {

  const navigate = useNavigate();

  return (
    <div className="dashboard">
      {/* Header superior */}
      <DashboardNavbar />

      {/* Encabezado de página */}
      <PageHeader title="Dashboard" subtitle="Menú principal" />

      {/* Cards */}
      <div className="dashboard-cards">
        <CardDashboard
          title="Afiliados Activos"
          buttonText="+ Ver Afiliados"
          number={430}
          onButtonClick={() => navigate("/afiliados")}
          icon={LogoAfiliadosActivos}
        />
        <CardDashboard
          title="Prestadores Activos"
          buttonText="+ Ver Prestadores"
          number={128}
          onButtonClick={() => console.log("Ver Prestadores")}
          icon={LogoPrestadoresActivos}
        />
        <CardDashboard
          title="Horarios de atención"
          buttonText="+ Ver Horarios de Atención"
          number={50}
          onButtonClick={() => console.log("Ver Horarios")}
          icon={LogoHorariosAtencion}
        />
      </div>
    </div>
  );
};

export default Dashboard;
