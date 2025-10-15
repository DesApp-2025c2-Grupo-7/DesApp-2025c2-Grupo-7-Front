import React, { useState } from "react";
import Input from "../genericos/Input";
import Button from "../genericos/Button";
import type { Direccion } from "../../types/afiliados";

interface ModalDireccionAfiliadoProps {
  personaId: number;
  direccion: Direccion;
  onClose: () => void;
  onSave: (direccion: Direccion) => void;
}

const ModalDireccionAfiliado: React.FC<ModalDireccionAfiliadoProps> = ({
  personaId,
  direccion,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Direccion>({
    id: direccion.id,
    calle: direccion.calle,
    numero: direccion.numero,
    localidad: direccion.localidad,
    codigoPostal: direccion.codigoPostal,
    depto: direccion.depto,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof Direccion, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === "" ? (field === "depto" ? null : "") : value
    }));
  };

  const handleSave = async () => {
    if (!formData.calle || !formData.numero || !formData.localidad) {
      alert("Por favor, completa todos los campos obligatorios (calle, número, localidad)");
      return;
    }

    setLoading(true);
    try {
      let direccionGuardada: Direccion;

      if (formData.id && formData.id > 0) {
        // Actualizar dirección existente
        const response = await fetch(
          `http://localhost:3000/personas/${personaId}/direcciones/${formData.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Error al actualizar la dirección");
        }

        direccionGuardada = await response.json();
      } else {
        // Crear nueva dirección
        const response = await fetch(
          `http://localhost:3000/personas/${personaId}/direcciones`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Error al crear la dirección");
        }

        direccionGuardada = await response.json();
      }

      onSave(direccionGuardada);
    } catch (error) {
      console.error("Error guardando dirección:", error);
      alert("Error al guardar la dirección. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{formData.id && formData.id > 0 ? "Editar Dirección" : "Agregar Nueva Dirección"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-row">
            <label>Calle *</label>
            <Input
              type="text"
              value={formData.calle}
              onChange={(value) => handleInputChange("calle", value)}
              placeholder="Ingresa la calle"
            />
          </div>

          <div className="form-row-double">
            <div className="form-row-double-item-left">
              <label>Número *</label>
              <Input
                type="text"
                value={formData.numero}
                onChange={(value) => handleInputChange("numero", value)}
                placeholder="Nº"
              />
            </div>
            <div className="form-row-double-item-right">
              <label>Departamento</label>
              <Input
                type="text"
                value={formData.depto || ""}
                onChange={(value) => handleInputChange("depto", value)}
                placeholder="Depto (opcional)"
              />
            </div>
          </div>

          <div className="form-row">
            <label>Localidad *</label>
            <Input
              type="text"
              value={formData.localidad}
              onChange={(value) => handleInputChange("localidad", value)}
              placeholder="Ingresa la localidad"
            />
          </div>

          <div className="form-row">
            <label>Código Postal</label>
            <Input
              type="text"
              value={formData.codigoPostal || ""}
              onChange={(value) => handleInputChange("codigoPostal", value)}
              placeholder="Código postal (opcional)"
            />
          </div>
        </div>

        <div className="modal-actions">
          <Button variant="cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
      
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .form-row {
          margin-bottom: 1rem;
        }
        
        .form-row label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .form-row-double {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .form-row-double-item-left,
        .form-row-double-item-right {
          flex: 1;
        }
        
        .form-row-double-item-left label,
        .form-row-double-item-right label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default ModalDireccionAfiliado;