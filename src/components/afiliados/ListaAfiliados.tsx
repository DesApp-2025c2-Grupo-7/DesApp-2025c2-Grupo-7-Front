import React from "react";
import { Edit } from "lucide-react";
import Button from "../genericos/Button";
import "../genericos/ListaEstilos.css"

interface Afiliado {
    id: number;
    nombre: string;
}

interface ListaAfiliadosProps {
    afiliados: Afiliado[];
}

const ListaAfiliados: React.FC<ListaAfiliadosProps> = ({ afiliados }) => {
    return (
        <div className="lista-estilos">
            <h3>Resultados</h3>
            <ul>
                {afiliados.map((afiliado) => (
                    <li key={afiliado.id}>
                        <div className="item-info">
                            <span className="nombre">{afiliado.nombre}</span>
                        </div>
                        <div className="acciones">
                            <Button variant="secondary" size="small">+ Ver más</Button>
                            <Button variant="secondary" size="small" icon={Edit} iconPosition="left">
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
