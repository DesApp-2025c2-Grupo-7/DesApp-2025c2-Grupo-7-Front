import React from "react";
import Button from "../genericos/Button";
import "../genericos/HeaderEstilos.css";
import { ArrowLeft } from "lucide-react";

interface AfiliadosHeaderProps {
    onVolver?: () => void;
    onAlta?: () => void;
}

const AfiliadosHeader: React.FC<AfiliadosHeaderProps> = ({
    onVolver,
    onAlta,
}) => {
    return (
        <div className="seccion-header">
            <h2>Gestión de Afiliados</h2>
            <div className="seccion-header-buttons">
                <Button variant="back"  icon={ArrowLeft} onClick={onVolver}>
                    Volver
                </Button>
                <Button variant="primary" onClick={onAlta}>
                    Dar de alta Afiliado
                </Button>
            </div>
        </div>
    );
};

export default AfiliadosHeader;
