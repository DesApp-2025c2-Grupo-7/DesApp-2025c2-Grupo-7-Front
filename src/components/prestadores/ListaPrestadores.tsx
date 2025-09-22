import React from "react";
import { Edit } from "lucide-react";
import Button from "../genericos/Button";
import "../genericos/ListaEstilos.css"

interface Prestador {
    id: number;
    nombre: string;
    especialidad?: string;
}

interface ListaPrestadoresProps {
    prestadores: Prestador[];
}

const ListaPrestadores: React.FC<ListaPrestadoresProps> = ({ prestadores }) => {
    return (
        <div className="lista-estilos">
            <h3>Resultados</h3>
            <ul>
                {prestadores.map((prestador) => (
                    <li key={prestador.id}>
                        <div className="item-info">
                            <span className="nombre">{prestador.nombre}</span>
                            {prestador.especialidad && (
                                <span className="detalle">{prestador.especialidad}</span>
                            )}
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

export default ListaPrestadores;