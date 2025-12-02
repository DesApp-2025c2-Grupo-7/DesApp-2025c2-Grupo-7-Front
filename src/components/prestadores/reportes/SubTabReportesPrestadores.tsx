// SubTabsReportesPrestadores.tsx
import React from "react";
import "./SubTabReportesPrestadores.css";

interface SubTabsReportesPrestadoresProps {
  activeSubTab: "especialidades" | "altasPeriodo";
  onSubTabChange: (tab: "especialidades" | "altasPeriodo") => void;
}

const SubTabsReportesPrestadores: React.FC<SubTabsReportesPrestadoresProps> = ({
  activeSubTab,
  onSubTabChange,
}) => {
  return (
    <div className="subtabs-reportes-container">
      <button
        className={`subtab-button ${activeSubTab === "especialidades" ? "active" : ""}`}
        onClick={() => onSubTabChange("especialidades")}
      >
        Prestadores por Especialidad
      </button>
      <button
        className={`subtab-button ${activeSubTab === "altasPeriodo" ? "active" : ""}`}
        onClick={() => onSubTabChange("altasPeriodo")}
      >
        Altas por Periodo
      </button>
    </div>
  );
};

export default SubTabsReportesPrestadores;
