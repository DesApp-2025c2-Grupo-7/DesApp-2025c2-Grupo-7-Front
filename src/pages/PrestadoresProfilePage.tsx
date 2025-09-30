
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/genericos/Header";
import HeaderPrestador from "../components/prestadores/HeaderPrestadores";
import "./PrestadorProfile.css";
import type { Prestador } from "../types/prestadores";
import Button from "../components/genericos/Button"; "../components/genericos/Button";

const PrestadorProfilePage: React.FC = () => {
  const [prestador, setPrestador] = useState<Prestador | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;

    const fetchPrestador = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/prestadores/${id}`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos del prestador");
        }
        const data: Prestador = await response.json();
        setPrestador(data);
      } catch (error) {
        console.error(error);
        setPrestador(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestador();
  }, [id]);

  const handleVolver = () => navigate("/prestadores");

  if (loading) {
    return (
      <div className="admin-page">
        <Header
          title="Panel de Administración"
          subtitle="Prestador - Información y estado"
        />
        <div className="admin-content">
          <HeaderPrestador onVolver={handleVolver} />
          <div className="prestador-form">
            {Array.from({ length: 10 }).map((_, i) => (
              <div className="form-row" key={i}>
                <label>&nbsp;</label>
                <span className="skeleton">&nbsp;</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Prestador - Información y estado"
      />
      <div className="admin-content">
        <HeaderPrestador onVolver={handleVolver} />

        {prestador ? (
          <div className="prestador-form">
            {/* Datos principales */}
            <div className="form-row">
              <label>Nro de CUIL o CUIT</label>
              <span>{prestador.numeroCUIL}</span>
            </div>
            <div className="form-row">
              <label>Nombre completo</label>
              <span>{prestador.nombreCompleto}</span>
            </div>
            <div className="form-row">
              <label>Teléfono</label>
              <span>{prestador.telefono?.join(", ")}</span>
            </div>
            <div className="form-row">
              <label>Mail</label>
              <span>{prestador.email?.join(", ")}</span>
            </div>

            {/* Tipo de prestador */}
            <div className="form-row">
              <label>Tipo de prestador</label>
              <span>{prestador.tipoPrestacion}</span>
            </div>

            {/* Especialidades */}
            <div className="form-row" style={{ gridColumn: "span 2" }}>
              <label>Especialidades</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {prestador.especialidades?.map((esp, i) => (
                  <span
                    key={i}
                    style={{
                      background: "#e9ecef",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      color: "#2c3e50",
                    }}
                  >
                    {esp}
                  </span>
                ))}
              </div>
            </div>

            {/* Direcciones y horarios */}
            <div className="schedules">
              {prestador.direccion?.map((dir, i) => (
                <div className="schedule-card" key={i}>
                  <div className="schedule-header">
                    <h4>
                      Dirección: {dir.calle} {dir.numero}, {dir.localidad} (
                      {dir.codigoPostal || "—"})
                    </h4>
                  </div>
                  <div className="schedule-list">
                    {dir.horariosAtencion?.map((hor, j) => (
                      <div className="schedule-item" key={j}>
                        <strong>{hor.dia}</strong> - {hor.desde}
                        <span className="schedule-badge">
                          Turnos: {hor.duracionTurno}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="schedule-actions">
                    <Button variant="primary" size="small" >Ver más</Button>
                    <Button variant="secondary" size="small">Editar</Button>
                  </div>
                </div>
              ))}
              <Button className="add-schedule">
                + Agregar nuevo horario de atención
              </Button>
            </div>

            {/* Fecha de baja */}
            <div className="form-row" style={{ gridColumn: "span 2" }}>
              <label>Fecha de baja</label>
              <span>{(prestador as any).fechaBaja || "Activo"}</span>
            </div>
          </div>
        ) : (
          <p>No se encontró el prestador</p>
        )}
      </div>
    </div>
  );
};

export default PrestadorProfilePage;

