import React, { useEffect, useState } from "react";
import "./PageEstilos.css";
import Header from "../components/genericos/Header";
import CardDashboard from "../components/genericos/CardDashboard";
import { Users, UserCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/genericos/PageHeader";

const Dashboard: React.FC = () => {
const navigate = useNavigate();
const [afiliados, setAfiliados] = useState<any[]>([]);
const [prestadores, setPrestadores] = useState<any[]>([]);

useEffect(() => {
const fetchData = async () => {
try {
const resAfiliados = await fetch("http://localhost:3000/afiliados");
const dataAfiliados = await resAfiliados.json();
setAfiliados(dataAfiliados);


    const resPrestadores = await fetch("http://localhost:3000/prestadores");
    const dataPrestadores = await resPrestadores.json();
    setPrestadores(dataPrestadores);
  } catch (error) {
    console.error("Error al obtener datos del backend:", error);
  }
};
fetchData();


}, []);

return ( <div className="admin-page"> <Header 
     title="Panel de Administración" 
     subtitle="Medicina Prepaga - Administración de prestadores médicos y centros de salud"
   />


  <div className="admin-content">
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
        number={prestadores.length}
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
