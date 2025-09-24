import React from "react";
import "./PageEstilos.css";
import Header from "../components/genericos/Header";
import CardDashboard from "../components/genericos/CardDashboard";
import { Users, UserCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/genericos/PageHeader";
import  afiliados  from "../../data/afiliados-mock-backend.json";


const Dashboard: React.FC = () => {

  const navigate = useNavigate();

  return (
    <div className="admin-page">
      {/* Header superior */}
      <Header 
        title="Panel de Administración" 
        subtitle="Medicina Prepaga - Administración de prestadores médicos y centros de salud"
      />

      <div className="admin-content">

        {/* Encabezado de página */}
        <PageHeader title="Dashboard" subtitle="Menú principal" />

        <div className="dashboard-cards">
          <CardDashboard
            title="Afiliados Activos"
            buttonText="+ Ver Afiliados"
            number={afiliados.length}
            onButtonClick={() => navigate("/afiliados")}
            icon={Users}
          />
          <CardDashboard
            title="Prestadores Activos"
            buttonText="+ Ver Prestadores"
            number={128}
            onButtonClick={() => navigate("/prestadores")}
            icon={UserCheck}
          />
          <CardDashboard
            title="Horarios de atención"
            buttonText="+ Ver Horarios de Atención"
            number={50}
            onButtonClick={() => console.log("Ver Horarios")}
            icon={Clock}
            />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
