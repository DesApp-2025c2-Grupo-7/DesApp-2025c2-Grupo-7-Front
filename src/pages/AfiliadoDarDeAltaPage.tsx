/* import { useNavigate } from "react-router-dom"; */
import Header from "../components/genericos/Header";
import SubHeader from "../components/genericos/SubHeader";
import "./AfiliadoProfile.css";
import AfiliadosFormEdit from "../components/afiliados/AfiliadosFormEdit";

export function AfiliadoDarDeAlta() {
  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Afiliado - Dar de alta afiliado"
      />
      <div className="admin-content">
        <SubHeader title="Dar de alta Afiliado" />
        <AfiliadosFormEdit />
      </div>
    </div>
  );
}
