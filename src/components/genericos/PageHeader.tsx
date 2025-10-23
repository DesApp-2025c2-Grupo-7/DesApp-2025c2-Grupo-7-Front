import React from "react";
import "./HeaderEstilos.css";
import Button from "./Button";
import { ArrowLeft, UserPlus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onVolver?: () => void;
  onAlta?: () => void;
  altaText?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, onVolver, onAlta, altaText }) => {
  return (
    <div className="seccion-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      <div className="seccion-header-buttons">
        {onVolver && (
          <Button variant="back" icon={ArrowLeft} onClick={onVolver}>
            Volver al menú
          </Button>
        )}
        {onAlta && (
          <Button variant="primary" icon={UserPlus} onClick={onAlta}>
            {altaText || 'Agregar'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
