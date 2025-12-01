import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import type { Especialidad } from "../../types/prestadores";
import "./CardEspecialidades.css";

interface CardEspecialidadesProps {
  especialidades: Especialidad[];
  seleccionadas: Especialidad[];
  onChange: (seleccionadas: Especialidad[]) => void;
}

export default function CardEspecialidades({
  especialidades,
  seleccionadas,
  onChange,
}: CardEspecialidadesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = (especialidades || []).filter(opt =>
    opt.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (option: Especialidad) => {
    const isSelected = (seleccionadas || []).some(s => s.id === option.id);
    if (isSelected) {
      onChange((seleccionadas || []).filter(s => s.id !== option.id));
    } else {
      onChange([...(seleccionadas || []), option]);
    }
  };

  const handleRemove = (optionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange((seleccionadas || []).filter(s => s.id !== optionId));
  };

  const handleSelectAll = () => {
    if ((seleccionadas || []).length === filteredOptions.length) {
      // Deseleccionar todos los filtrados
      const filteredIds = new Set(filteredOptions.map(o => o.id));
      onChange((seleccionadas || []).filter(s => !filteredIds.has(s.id)));
    } else {
      // Seleccionar todos los filtrados que no estén seleccionados
      const newSelections = filteredOptions.filter(
        opt => !(seleccionadas || []).some(s => s.id === opt.id)
      );
      onChange([...(seleccionadas || []), ...newSelections]);
    }
  };

  const allFilteredSelected = filteredOptions.length > 0 && 
    filteredOptions.every(opt => (seleccionadas || []).some(s => s.id === opt.id));

  return (
    <div 
      ref={dropdownRef}
      style={{
        position: "relative",
        width: "100%",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Campo de selección */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minHeight: "42px",
          padding: "8px 36px 8px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          backgroundColor: "white",
          cursor: "pointer",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          position: "relative",
          transition: "border-color 0.2s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#9ca3af";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#d1d5db";
        }}
      >
        {seleccionadas.length === 0 ? (
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>
            Seleccionar especialidades...
          </span>
        ) : (
          (seleccionadas || []).map(opt => (
            <span
              key={opt.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "#e0f2fe",
                color: "#0c4a6e",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: "500"
              }}
            >
              {opt.nombre}
              <X
                size={14}
                style={{ cursor: "pointer", flexShrink: 0 }}
                onClick={(e) => handleRemove(opt.id, e)}
              />
            </span>
          ))
        )}
        
        <ChevronDown
          size={20}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: `translateY(-50%) rotate(${isOpen ? "180deg" : "0deg"})`,
            transition: "transform 0.2s",
            color: "#6b7280",
            pointerEvents: "none"
          }}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            zIndex: 50,
            maxHeight: "300px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Buscador */}
          <div style={{ padding: "8px", borderBottom: "1px solid #e5e7eb" }}>
            <input
              type="text"
              placeholder="Buscar especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "90%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Seleccionar todos */}
          {filteredOptions.length > 0 && (
            <div
              onClick={handleSelectAll}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                fontWeight: "600",
                fontSize: "13px",
                color: "#374151"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  border: "2px solid #d1d5db",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: allFilteredSelected ? "#3b82f6" : "white",
                  borderColor: allFilteredSelected ? "#3b82f6" : "#d1d5db",
                  flexShrink: 0
                }}
              >
                {allFilteredSelected && <Check size={14} color="white" strokeWidth={3} />}
              </div>
              {allFilteredSelected ? "Deseleccionar todo" : "Seleccionar todo"}
              <span style={{ marginLeft: "auto", color: "#9ca3af", fontSize: "12px" }}>
                ({(seleccionadas || []).length}/{(especialidades || []).length})
              </span>
            </div>
          )}

          {/* Lista de opciones */}
          <div style={{ overflowY: "auto", maxHeight: "240px" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                No se encontraron especialidades
              </div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = (seleccionadas || []).some(s => s.id === option.id);
                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggle(option)}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: isSelected ? "#eff6ff" : "white",
                      transition: "background-color 0.15s"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "#f9fafb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isSelected ? "#eff6ff" : "white";
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid #d1d5db",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isSelected ? "#3b82f6" : "white",
                        borderColor: isSelected ? "#3b82f6" : "#d1d5db",
                        flexShrink: 0,
                        transition: "all 0.15s"
                      }}
                    >
                      {isSelected && <Check size={14} color="white" strokeWidth={3} />}
                    </div>
                    <span style={{ 
                      fontSize: "14px", 
                      color: "#374151",
                      fontWeight: isSelected ? "500" : "400"
                    }}>
                      {option.nombre}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}