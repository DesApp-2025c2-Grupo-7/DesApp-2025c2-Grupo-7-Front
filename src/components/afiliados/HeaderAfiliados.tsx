import React from "react";
import Button from "../genericos/Button";
import "../genericos/HeaderEstilos.css";
import { ArrowLeft, UserPlus } from "lucide-react";

interface AfiliadosHeaderProps {
  onVolver?: () => void;
  onAlta?: () => void;
  modoEdicion?: boolean;
  afiliadoButtonText?: string;
}

const AfiliadosHeader: React.FC<AfiliadosHeaderProps> = ({
  onVolver,
  onAlta,
  modoEdicion = false,
  afiliadoButtonText,
}) => {
  return (
    <div className="seccion-header">
      <div className="titulo-con-estado">
        <h2>Gestión de Afiliados</h2>
        {modoEdicion && (
          <span className="badge-modo-edicion">Modo Edición</span>
        )}
      </div>
      <div className="seccion-header-buttons">
        {onVolver && (
          <Button variant="back" icon={ArrowLeft} onClick={onVolver}>
            Volver
          </Button>
        )}

        {onAlta && (
          <Button variant="primary" icon={UserPlus} onClick={onAlta}>
            {afiliadoButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AfiliadosHeader;
