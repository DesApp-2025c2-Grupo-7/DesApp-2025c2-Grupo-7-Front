import Header from "../components/genericos/Header";
import HeaderPrestador from "../components/prestadores/HeaderPrestadores";
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
        <HeaderPrestador onVolver={handleVolver} />
        <PrestadoresFormEdit />
      </div>
    </div>
  );
}

/* EXTRA:

1. Modificar el headerPrestador para que sólo quede el "Volver" */
