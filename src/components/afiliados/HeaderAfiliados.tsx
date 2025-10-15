import React from "react";
import Button from "../genericos/Button";
import "../genericos/HeaderEstilos.css";
import { ArrowLeft, UserPlus } from "lucide-react";

interface AfiliadosHeaderProps {
    onVolver?: () => void;
    onAlta?: () => void;
    mostrarBotonIntegrante?: boolean;
    modoEdicion?: boolean;
}

const AfiliadosHeader: React.FC<AfiliadosHeaderProps> = ({
    onVolver,
    onAlta,
    mostrarBotonIntegrante = false,
    modoEdicion = false,
}) => {
    return (
        <div className="seccion-header">
            <div className="titulo-con-estado">
                <h2>Gestión de Afiliados</h2>
                {modoEdicion && (
                    <span className="badge-modo-edicion">
                        Modo Edición
                    </span>
                )}
            </div>
            <div className="seccion-header-buttons">
                <Button variant="back"  icon={ArrowLeft} onClick={onVolver}>
                    Volver
                </Button>
                {mostrarBotonIntegrante && (
                    <Button 
                        variant="secondary" 
                        icon={UserPlus} 
                        onClick={() => {
                            // Disparar evento personalizado para que lo capture AfiliadosForm
                            window.dispatchEvent(new CustomEvent('abrirModalAgregarIntegrante'));
                        }}
                    >
                        Agregar Integrante
                    </Button>
                )}
                {!mostrarBotonIntegrante && (
                    <Button variant="primary" icon={UserPlus} onClick={onAlta}>
                        Dar de alta Afiliado
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AfiliadosHeader;
