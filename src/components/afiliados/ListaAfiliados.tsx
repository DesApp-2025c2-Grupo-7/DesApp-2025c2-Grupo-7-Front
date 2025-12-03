import React from "react";
import { Edit, Edit2 } from "lucide-react";
import Button from "../genericos/Button";
import { useNavigate } from "react-router-dom";
import {
  esPersonaActiva,
  getTextoEstadoPersona,
} from "../../utils/estadoAfiliado";
import "./ListaAfiliados.css";
import type { ListaAfiliadosProps } from "../../types/afiliados";

const ListaAfiliados: React.FC<ListaAfiliadosProps> = ({
  afiliados,
  totalAfiliados,
}) => {
  const navigate = useNavigate();

  const handleVerMas = (afiliado: any) => {
    // Si es un integrante, navegar al perfil del titular pero marcando el integrante actual
    if (!afiliado.esTitular && afiliado.titularId) {
      const integranteKey = `${afiliado.credencial}-${afiliado.sufijo}`;
      navigate(`/afiliados/${afiliado.titularId}?integrante=${integranteKey}`);
    } else {
      navigate(`/afiliados/${afiliado.id}`);
    }
  };

  const handleEditar = (afiliado: any) => {
    // Si es un integrante, navegar al perfil del titular pero marcando el integrante actual y modo edición
    if (!afiliado.esTitular && afiliado.titularId) {
      const integranteKey = `${afiliado.credencial}-${afiliado.sufijo}`;
      navigate(
        `/afiliados/${afiliado.titularId}?integrante=${integranteKey}&modo=editar`
      );
    } else {
      navigate(`/afiliados/${afiliado.id}?modo=editar`);
    }
  };

  // Usar funciones utilitarias estandarizadas
  const getEstadoText = (afiliado: any) => getTextoEstadoPersona(afiliado);
  const isActiveAfiliado = (afiliado: any) => esPersonaActiva(afiliado);

  return (
    <div className="lista-estilos">
      <h3>Resultados ({totalAfiliados ?? afiliados.length} afiliados)</h3>
      <ul>
        {afiliados.map((afiliado) => (
          <li
            key={`${afiliado.esTitular ? "titular" : "integrante"}-${
              afiliado.id
            }`}
          >
            <div className="item-info">
              <span className="nombre">
                {afiliado.nombre} {afiliado.apellido}
              </span>
              <span className="detalle">
                #{afiliado.credencial}-{afiliado.sufijo} | DNI:{" "}
                {afiliado.numeroDocumento} | Plan: {afiliado.planMedico}
                {!isActiveAfiliado(afiliado) && afiliado.fechaBaja && (
                  <>
                    {" "}
                    |{" "}
                    <span className="fecha-baja">
                      Fecha baja: {afiliado.fechaBaja}
                    </span>
                  </>
                )}
              </span>
              <span
                className={`estado ${
                  isActiveAfiliado(afiliado) ? "activo" : "inactivo"
                }`}
              >
                {getEstadoText(afiliado)}
              </span>
            </div>
            <div className="acciones">
              <Button
                variant="primary"
                size="small"
                onClick={() => handleVerMas(afiliado)}
              >
                + Ver más
              </Button>
              {isActiveAfiliado(afiliado) && (
                <Button
                  variant="primary"
                  size="small"
                  icon={Edit2}
                  iconPosition="left"
                  onClick={() => handleEditar(afiliado)}
                >
                  Editar
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaAfiliados;
