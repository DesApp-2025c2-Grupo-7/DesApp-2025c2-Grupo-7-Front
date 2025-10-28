import Header from "../components/genericos/Header";
import SubHeader from "../components/genericos/SubHeader";
import PrestadoresFormEdit from "../components/prestadores/PrestadoresFormEdit";
import { useNavigate } from "react-router-dom";

export function PrestadorDarDeAlta() {
  const navigate = useNavigate();
  const handleVolver = () => navigate("/prestadores");
  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Prestador - Dar de alta"
      />
      <div className="admin-content">
        <SubHeader onVolver={handleVolver} />
        <PrestadoresFormEdit />
      </div>
    </div>
  );
}
