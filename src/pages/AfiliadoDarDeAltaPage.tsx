import { useNavigate } from "react-router-dom";
import Header from "../components/genericos/Header";
import HeaderAfiliado from "../components/afiliados/HeaderAfiliados";
import "./AfiliadoProfile.css";
import AfiliadosFormEdit from "../components/afiliados/AfiliadosFormEdit";

export function AfiliadoDarDeAlta() {
  const navigate = useNavigate();
  const handleVolver = () => navigate("/afiliados");
  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Afiliado - Dar de alta afiliado"
      />
      <div className="admin-content">
        <HeaderAfiliado onVolver={handleVolver} />
        <AfiliadosFormEdit />
      </div>
    </div>
  );
}

/* const AfiliadoProfile: React.FC = () => {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [grupoFamiliar, setGrupoFamiliar] = useState<GrupoFamiliar | null>(
    null
  );
  const [miembrosGrupo, setMiembrosGrupo] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;

    const fetchAfiliado = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/afiliados/${id}`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos del afiliado");
        }
        const data: Afiliado = await response.json();
        setAfiliado(data);

        // Obtener información del grupo familiar
        if (data.grupoFamiliar) {
          // Obtener información del plan del grupo familiar
          const grupoResponse = await fetch(
            `http://localhost:3000/grupos-familiares/${data.grupoFamiliar}`
          );
          if (grupoResponse.ok) {
            const grupoData: GrupoFamiliar = await grupoResponse.json();
            setGrupoFamiliar(grupoData);
          }

          // Obtener todos los miembros del grupo familiar
          const miembrosResponse = await fetch(
            `http://localhost:3000/afiliados?grupoFamiliar=${data.grupoFamiliar}`
          );
          if (miembrosResponse.ok) {
            const miembrosData: Afiliado[] = await miembrosResponse.json();
            setMiembrosGrupo(miembrosData);
          }
        }
      } catch (error) {
        console.error(error);
        setAfiliado(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAfiliado();
  }, [id]);

  const handleVolver = () => navigate("/afiliados");

  const handleDarDeBaja = async () => {
    if (afiliado) {
      const fechaBaja = new Date().toISOString().split("T")[0];
      try {
        await fetch(`http://localhost:3000/afiliados/${afiliado.id}/baja`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fechaBaja }),
        });

        setAfiliado({ ...afiliado, fechaBaja });
        alert("El Afiliado será dado de baja en la fecha " + fechaBaja + " 🚫");
      } catch (error) {
        console.error("Error al dar de baja:", error);
        alert("No se pudo dar de baja al afiliado ❌");
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <Header
          title="Panel de Administración"
          subtitle="Afiliado - Información personal y estado"
        />
        <div className="admin-content">
          <HeaderAfiliado onVolver={handleVolver} />
          <div className="afiliado-form">
            {Array.from({ length: 12 }).map((_, i) => (
              <div className="form-row" key={i}>
                <label>&nbsp;</label>
                <span className="skeleton">&nbsp;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Afiliado - Información personal y estado"
      />
      <div className="admin-content">
        <HeaderAfiliado onVolver={handleVolver} />
        {afiliado ? (
          <AfiliadosForm
            afiliado={afiliado}
            grupoFamiliar={grupoFamiliar}
            miembrosGrupo={miembrosGrupo}
            onDarDeBaja={handleDarDeBaja}
          />
        ) : (
          <p>No se encontró el afiliado</p>
        )}
      </div>
    </div>
  );
};

export default AfiliadoProfile;
 */
