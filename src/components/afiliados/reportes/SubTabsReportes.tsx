import React from "react";
import "./SubTabsReportes.css";

interface SubTabsReportesProps {
  activeSubTab: "situaciones" | "altasPeriodo";
  onSubTabChange: (tab: "situaciones" | "altasPeriodo") => void;
}

const SubTabsReportes: React.FC<SubTabsReportesProps> = ({
  activeSubTab,
  onSubTabChange,
}) => {
  return (
    <div className="subtabs-reportes-container">
      <button
        className={`subtab-button ${activeSubTab === "situaciones" ? "active" : ""}`}
        onClick={() => onSubTabChange("situaciones")}
      >
        Situaciones Terapéuticas
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

export default SubTabsReportes;
