import React from "react";
import "./Dashboard.css";
import HeaderDashboard from "../components/HeaderDashboard";
import CardDashboard from "../components/CardDashboard";
import LogoAfiliadosActivos from "../assets/icons/logo-AfiliadosActivos.svg";
import LogoHorariosAtencion from "../assets/icons/logo-HorariosAtencion.svg";
import LogoPrestadoresActivos from "../assets/icons/logo-PrestadoresActivos.svg";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <HeaderDashboard
        title="Panel de administración"
        subtitle="Gestión del sistema Medicina Integral"
      />

      {/* Títulos */}
      <div className="dashboard-title">
        <h2>Dashboard</h2>
        <p>Menú principal</p>
      </div>

      {/* Cards */}
      <div className="dashboard-cards">
        <CardDashboard
          title="Afiliados Activos"
          buttonText="+ Ver Afiliados"
          number={430}
          onButtonClick={() => console.log("Ver Afiliados")}
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
