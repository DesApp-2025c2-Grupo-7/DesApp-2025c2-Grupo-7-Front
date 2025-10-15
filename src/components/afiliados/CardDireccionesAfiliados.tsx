import React, { useState, useEffect } from "react";
import Button from "../genericos/Button";
import Input from "../genericos/Input";

import type { Direccion } from "../../types/afiliados";

interface CardDireccionesAfiliadosProps {
  direcciones?: Direccion[];
  personaId: number;
  modoEdicion?: boolean;
  onDireccionesChange?: (direcciones: Direccion[]) => void;
}

const CardDireccionesAfiliados: React.FC<CardDireccionesAfiliadosProps> = ({
  direcciones = [],
  personaId,
  modoEdicion = false,
  onDireccionesChange,
}) => {
  const [listaDirecciones, setListaDirecciones] = useState<Direccion[]>(direcciones);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion | null>(null);

  // Usar el modo de edición que viene del padre, no el interno
  const estaEnModoEdicion = modoEdicion;

  const handleVerMas = (direccion: Direccion) => {
    if (estaEnModoEdicion) {
      setDireccionSeleccionada(direccion);
    }
  };

  // Sincronizar direcciones cuando cambian desde el exterior
  useEffect(() => {
    setListaDirecciones(direcciones);
  }, [direcciones]);

  const handleCloseModal = () => setDireccionSeleccionada(null);

  const handleSaveDireccion = (dirActualizada: Direccion) => {
    const nuevasDirecciones = (() => {
      const existe = listaDirecciones.find(d => d.id === dirActualizada.id);
      if (existe) {
        return listaDirecciones.map(d => (d.id === dirActualizada.id ? dirActualizada : d));
      } else {
        return [...listaDirecciones, dirActualizada];
      }
    })();
    
    setListaDirecciones(nuevasDirecciones);
    // Notificar cambios al componente padre para que se incluyan en el objeto del afiliado
    onDireccionesChange?.(nuevasDirecciones);
    setDireccionSeleccionada(null);
  };

  // Modal simple inline
  const ModalSimple = ({ direccion, onClose, onSave }: { 
    direccion: Direccion; 
    onClose: () => void; 
    onSave: (dir: Direccion) => void; 
  }) => {
    const [formData, setFormData] = useState<Direccion>(direccion);

    const handleSave = () => {
      if (!formData.calle || !formData.numero || !formData.localidad) {
        alert("Por favor, completa todos los campos obligatorios (calle, número, localidad)");
        return;
      }
      onSave(formData);
    };

    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          maxWidth: '500px', 
          width: '90%' 
        }}>
          <h3>{formData.id ? "Editar Dirección" : "Nueva Dirección"}</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label>Calle *</label>
            <Input
              type="text"
              value={formData.calle}
              onChange={(value) => setFormData(prev => ({ ...prev, calle: value }))}
              placeholder="Ingresa la calle"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>Número *</label>
              <Input
                type="text"
                value={formData.numero}
                onChange={(value) => setFormData(prev => ({ ...prev, numero: value }))}
                placeholder="Nº"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Departamento</label>
              <Input
                type="text"
                value={formData.depto || ""}
                onChange={(value) => setFormData(prev => ({ ...prev, depto: value || null }))}
                placeholder="Depto (opcional)"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Localidad *</label>
            <Input
              type="text"
              value={formData.localidad}
              onChange={(value) => setFormData(prev => ({ ...prev, localidad: value }))}
              placeholder="Ingresa la localidad"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label>Código Postal</label>
            <Input
              type="text"
              value={formData.codigoPostal || ""}
              onChange={(value) => setFormData(prev => ({ ...prev, codigoPostal: value }))}
              placeholder="Código postal (opcional)"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const handleAgregarNuevaDireccion = () => {
    const nuevaDireccion: Direccion = {
      id: 0, // ID temporal, se asignará al guardar
      calle: "",
      numero: "",
      localidad: "",
      codigoPostal: "",
      depto: null,
    };
    handleVerMas(nuevaDireccion);
  };

  const handleEliminarDireccion = async (direccion: Direccion) => {
    if (!window.confirm("¿Deseas eliminar esta dirección?")) return;

    try {
      if (direccion.id && direccion.id > 0) {
        // Solo hacer DELETE si tiene un ID real del backend
        const response = await fetch(
          `http://localhost:3000/personas/${personaId}/direcciones/${direccion.id}`,
          { method: "DELETE" }
        );
        
        if (!response.ok) {
          throw new Error("Error al eliminar dirección del servidor");
        }
      }

      const nuevasDirecciones = listaDirecciones.filter(d => d.id !== direccion.id);
      setListaDirecciones(nuevasDirecciones);
      // Notificar cambios al componente padre
      onDireccionesChange?.(nuevasDirecciones);
    } catch (err) {
      console.error("Error eliminando dirección", err);
      alert("No se pudo eliminar la dirección");
    }
  };

  return (
    <div className="direcciones-container">
      <h4>Direcciones</h4>
      <div className="direcciones-list">
        {listaDirecciones.map((dir, i) => (
          <div className="direccion-card" key={dir.id || i}>
            <div className="direccion-info">
              <p>
                <strong>{dir.calle} {dir.numero}</strong>
                {dir.depto && `, Depto ${dir.depto}`}
              </p>
              <p>{dir.localidad} - CP: {dir.codigoPostal || "—"}</p>
            </div>
            {estaEnModoEdicion && (
              <div className="direccion-actions">
                <Button variant="primary" size="small" onClick={() => handleVerMas(dir)}>
                  Editar
                </Button>
                <Button variant="danger" size="small" onClick={() => handleEliminarDireccion(dir)}>
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Las direcciones solo pueden editarse cuando el formulario completo está en modo edición */}

      {estaEnModoEdicion && (
        <div className="add-direccion-button">
          <Button variant="secondary" onClick={handleAgregarNuevaDireccion}>
            + Agregar nueva dirección
          </Button>
        </div>
      )}

      {direccionSeleccionada && (
        <ModalSimple
          direccion={direccionSeleccionada}
          onClose={handleCloseModal}
          onSave={handleSaveDireccion}
        />
      )}
    </div>
  );
};

export default CardDireccionesAfiliados;