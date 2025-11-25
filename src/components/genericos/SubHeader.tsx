import React from "react";
import Button from "./Button";
import "../genericos/HeaderEstilos.css";
import "../afiliados/ListaAfiliados.css";
import { ArrowLeft, UserPlus } from "lucide-react";

interface SubHeaderProps {
  title: string;
  subtitle?: string;
  onVolver?: () => void;
  onAlta?: () => void;
  modoEdicion?: boolean;
  buttonText?: string;
  typeTag?: string;
  statusLabel?: string;
  buttonIcon?: any;
}

const SubHeader: React.FC<SubHeaderProps> = ({
  title,
  subtitle,
  onVolver,
  onAlta,
  modoEdicion = false,
  buttonText,
  typeTag,
  statusLabel,
  buttonIcon,
}) => {
  return (
    <div className="seccion-header">
      <div className="titulo-con-estado">
        <h2>
          {title}
          {typeTag && <span className="type-tag">{` ${typeTag}`}</span>}
        </h2>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {modoEdicion && (
          <span className="badge-modo-edicion">Modo Edición</span>
        )}
      </div>
      <div className="seccion-header-buttons">
        {statusLabel &&
          (() => {
            const normalized = String(statusLabel).toLowerCase();
            const estadoClass = normalized.includes("inactivo")
              ? "inactivo"
              : "activo";
            return (
              <span className={`estado-badge ${estadoClass}`}>
                {statusLabel}
              </span>
            );
          })()}
        {onVolver && (
          <Button variant="back" icon={ArrowLeft} onClick={onVolver}>
            Volver al menú
          </Button>
        )}

        {onAlta && (
          <Button
            variant="primary"
            icon={buttonIcon ? buttonIcon : UserPlus}
            onClick={onAlta}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubHeader;
