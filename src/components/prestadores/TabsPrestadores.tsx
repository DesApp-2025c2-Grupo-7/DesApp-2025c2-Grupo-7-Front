import React from "react";
import "./TabsPrestadores.css";

interface TabsPrestadoresProps {
  activeTab: "lista" | "reportes";
  onTabChange: (tab: "lista" | "reportes") => void;
}

const TabsPrestadores: React.FC<TabsPrestadoresProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="tabs-container">
      <button
        className={`tab-button ${activeTab === "lista" ? "active" : ""}`}
        onClick={() => onTabChange("lista")}
      >
        Lista de Prestadores
      </button>
      <button
        className={`tab-button ${activeTab === "reportes" ? "active" : ""}`}
        onClick={() => onTabChange("reportes")}
      >
        Reportes
      </button>
    </div>
  );
};

export default TabsPrestadores;
