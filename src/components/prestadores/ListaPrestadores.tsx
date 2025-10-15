import React from "react";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../genericos/Button";
import "./ListaPrestadores.css"
import type { Prestador } from "../../types/prestadores";

const ListaPrestadores: React.FC<{ prestadores: Prestador[] }> = ({ prestadores }) => {
    const navigate = useNavigate();

    const handleVerMas = (id: number) => {
        navigate(`/prestadores/${id}`); // 👈 navega al perfil del prestador
    };

    return (
        <div className="prestadores-cards">
            <h3>Resultados</h3>
            <div className="cards-grid">
                {prestadores.map((prestador) => (
                    <div key={prestador.id} className="prestador-card">
                        <div className="card-header">
                            <h4 className="prestador-nombre">{prestador.nombreCompleto}</h4>
                            {prestador.especialidades.map((especialidad, i) =>(
                                <span key={i} className="prestador-especialidad">{String(especialidad)}</span>
                            ))}
                        </div>
                        <div className="card-actions">
                            <Button 
                                variant="primary" 
                                size="small" 
                                onClick={() => handleVerMas(prestador.id)}
                            >
                                + Ver más
                            </Button>
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
