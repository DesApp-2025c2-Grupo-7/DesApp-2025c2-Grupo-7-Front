import React from "react";
import "./TabsAfiliados.css";

interface TabsAfiliadosProps {
  activeTab: "lista" | "reportes";
  onTabChange: (tab: "lista" | "reportes") => void;
}

const TabsAfiliados: React.FC<TabsAfiliadosProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="tabs-container">
      <button
        className={`tab-button ${activeTab === "lista" ? "active" : ""}`}
        onClick={() => onTabChange("lista")}
      >
        Lista de Afiliados
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

export default TabsAfiliados;
