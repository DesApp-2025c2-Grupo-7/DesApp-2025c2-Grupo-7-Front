import React from "react";
import Button from "../genericos/Button";
import "../genericos/HeaderEstilos.css";
import { ArrowLeft, UserPlus } from "lucide-react";

interface AfiliadosHeaderProps {
    onVolver?: () => void;
    onAlta?: () => void;
    modoEdicion?: boolean;
    esTitular?: boolean;
    contexto?: 'lista' | 'titular' | 'integrante';
}

const AfiliadosHeader: React.FC<AfiliadosHeaderProps> = ({
    onVolver,
    onAlta,
    modoEdicion = false,
    esTitular = true,
    contexto = 'lista',
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
                
                {/* Lista de afiliados: mostrar "Dar de alta afiliado" */}
                {contexto === 'lista' && (
                    <Button variant="primary" icon={UserPlus} onClick={onAlta}>
                        Dar de alta Afiliado
                    </Button>
                )}
                
                {/* Info de titular: mostrar "Agregar integrante" si no está en modo edición */}
                {contexto === 'titular' && !modoEdicion && (
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
                
                {/* Info de integrante: no mostrar ningún botón adicional */}
            </div>
        </div>
    );
};

export default AfiliadosHeader;
