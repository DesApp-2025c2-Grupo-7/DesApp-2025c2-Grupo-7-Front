import React from "react";
import { Edit } from "lucide-react";
import Button from "../genericos/Button";
import { useNavigate } from "react-router-dom";
import "./ListaAfiliados.css"
import type { ListaAfiliadosProps } from "../../types/afiliados";

const ListaAfiliados: React.FC<ListaAfiliadosProps> = ({ afiliados }) => {
    const navigate = useNavigate();

    const handleVerMas = (id: number) => {
        navigate(`/afiliados/${id}`);
    };

    return (
        <div className="lista-estilos">
            <h3>Resultados</h3>
            <ul>
                {afiliados.map((afiliado) => (
                    <li key={afiliado.id}>
                        <div className="item-info">
                            <span className="nombre">{afiliado.nombre} {afiliado.apellido}</span>
                        </div>
                        <div className="acciones">
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => handleVerMas(afiliado.id)}
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
