import React from "react";
import "./AfiliadosHeader.css";

interface AfiliadosHeaderProps {
    onVolver?: () => void;
    onAlta?: () => void;
}

const AfiliadosHeader: React.FC<AfiliadosHeaderProps> = ({
    onVolver,
    onAlta,
}) => {
    return (
        <div className="afiliados-header">
            <h2>Gestión de afiliados</h2>
            <div className="afiliados-buttons">
                <button className="btn btn-secondary" onClick={onVolver}>
                    Volver al menú
                </button>
                <button className="btn btn-primary" onClick={onAlta}>
                    Dar de alta Afiliado
                </button>
            </div>
        </div>
    );
};

export default AfiliadosHeader;
