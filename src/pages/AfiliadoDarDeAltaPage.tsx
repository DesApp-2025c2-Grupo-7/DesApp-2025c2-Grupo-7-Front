/* import { useNavigate } from "react-router-dom"; */
import Header from "../components/genericos/Header";
import HeaderAfiliado from "../components/afiliados/HeaderAfiliados";
import "./AfiliadoProfile.css";
import AfiliadosFormEdit from "../components/afiliados/AfiliadosFormEdit";

export function AfiliadoDarDeAlta() {
  /* const navigate = useNavigate(); */
  /* const handleVolver = () => navigate("/afiliados"); */
  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Afiliado - Dar de alta afiliado"
      />
      <div className="admin-content">
        <HeaderAfiliado /* onVolver={handleVolver} */ />
        <AfiliadosFormEdit />
      </div>
    </div>
  );
}
