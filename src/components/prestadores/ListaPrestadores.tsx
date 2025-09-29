import React from "react";
import { Edit } from "lucide-react";
import Button from "../genericos/Button";
import "./ListaPrestadores.css"
import type {ListaPrestadoresProps } from "../../types/prestadores";

const ListaPrestadores: React.FC<ListaPrestadoresProps> = ({ prestadores }) => {
    return (
        <div className="prestadores-cards">
            <h3>Resultados</h3>
            <div className="cards-grid">
                {prestadores.map((prestador) => (
                    <div key={prestador.id} className="prestador-card">
                        <div className="card-header">
                            <h4 className="prestador-nombre">{prestador.nombreCompleto}</h4>
                            {prestador.especialidades.map((especialidad) =>(
                                <span className="prestador-especialidad">{especialidad} </span>)
                            )}
                        </div>
                        <div className="card-actions">
                            <Button variant="secondary" size="small">+ Ver más</Button>
                            <Button variant="primary" size="small" icon={Edit} iconPosition="left">
                                Editar
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListaPrestadores;