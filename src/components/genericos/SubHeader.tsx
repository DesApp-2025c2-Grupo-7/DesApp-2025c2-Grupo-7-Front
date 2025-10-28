import React from "react";
import Button from "./Button";
import "../genericos/HeaderEstilos.css";
import { ArrowLeft, UserPlus } from "lucide-react";

interface SubHeaderProps {
  title: string;
  subtitle?: string;
  onVolver?: () => void;
  onAlta?: () => void;
  modoEdicion?: boolean;
  buttonText?: string;
}

const SubHeader: React.FC<SubHeaderProps> = ({
  title,
  subtitle,
  onVolver,
  onAlta,
  modoEdicion = false,
  buttonText,
}) => {
  return (
    <div className="seccion-header">
      <div className="titulo-con-estado">
        <h2>{title}</h2>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {modoEdicion && (
          <span className="badge-modo-edicion">Modo Edición</span>
        )}
      </div>
      <div className="seccion-header-buttons">
        {onVolver && (
          <Button variant="back" icon={ArrowLeft} onClick={onVolver}>
            Volver al menú
          </Button>
        )}

        {onAlta && (
          <Button variant="primary" icon={UserPlus} onClick={onAlta}>
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubHeader;
