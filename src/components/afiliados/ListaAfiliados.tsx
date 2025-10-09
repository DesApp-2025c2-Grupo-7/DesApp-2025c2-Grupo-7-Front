import React from "react";
import { Edit } from "lucide-react";
import Button from "../genericos/Button";
import { useNavigate } from "react-router-dom";
import "./ListaAfiliados.css"
import type { ListaAfiliadosProps } from "../../types/afiliados";

const ListaAfiliados: React.FC<ListaAfiliadosProps> = ({ afiliados }) => {
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

    const getEstadoText = (afiliado: any) => {
        if (!afiliado.fechaBaja) return 'Activo';
        const today = new Date().toISOString().split('T')[0];
        if (afiliado.fechaBaja > today) {
            return `Activo hasta ${afiliado.fechaBaja}`;
        }
        return 'Inactivo';
    };

    const isActiveAfiliado = (afiliado: any) => {
        if (!afiliado.fechaBaja) return true;
        const today = new Date().toISOString().split('T')[0];
        return afiliado.fechaBaja > today;
    };

    return (
        <div className="lista-estilos">
            <h3>Resultados ({afiliados.length} afiliados)</h3>
            <ul>
                {afiliados.map((afiliado) => (
                    <li key={`${afiliado.esTitular ? 'titular' : 'integrante'}-${afiliado.id}`}>
                        <div className="item-info">
                            <span className="nombre">{afiliado.nombre} {afiliado.apellido}</span>
                            <span className="detalle">#{afiliado.credencial}-{afiliado.sufijo} | DNI: {afiliado.numeroDocumento} | Plan: {afiliado.planMedico}</span>
                            <span className={`estado ${isActiveAfiliado(afiliado) ? 'activo' : 'inactivo'}`}>
                                {getEstadoText(afiliado)}
                            </span>
                        </div>
                        <div className="acciones">
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => handleVerMas(afiliado)}
                            >
                                + Ver más
                            </Button>
                            <Button
                                variant="secondary"
                                size="small"
                                icon={Edit}
                                iconPosition="left"
                            >
                                Editar
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListaAfiliados;
