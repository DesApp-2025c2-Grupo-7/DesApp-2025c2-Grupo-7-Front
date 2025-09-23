import React from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import Button from "../genericos/Button";
import "../genericos/HeaderEstilos.css";

interface PrestadoresHeaderProps {
    onVolver?: () => void;
    onAlta?: () => void;
}

const PrestadoresHeader: React.FC<PrestadoresHeaderProps> = ({
    onVolver,
    onAlta,
}) => {
    return (
        <div className="seccion-header">
            <h2>Gestión de Prestadores</h2>
            <div className="seccion-header-buttons">
                <Button variant="back" icon={ArrowLeft} onClick={onVolver}>
                    Volver al menú
                </Button>
                <Button variant="primary" icon={UserPlus} onClick={onAlta}>
                    Dar de alta Prestador
                </Button>
            </div>
        </div>
    );
};

export default PrestadoresHeader;