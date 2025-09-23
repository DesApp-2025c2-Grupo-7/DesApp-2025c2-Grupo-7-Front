// AfiliadoProfile.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/genericos/Header";
import Button from "../components/genericos/Button";
import HeaderAfiliado from "../components/afiliados/HeaderAfiliados";
import "./AfiliadoProfile.css"; 

// ---- Datos de afiliados ----
export interface Afiliado {
  id: number;
  credencial: string;
  plan: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  mail: string;
  desde: string;
  hasta: string;
  fechaBaja?: string;
}

export const afiliados: Afiliado[] = [
  {
    id: 1,
    credencial: "1234567-01",
    plan: "Plan Premium",
    tipoDocumento: "DNI",
    numeroDocumento: "40123456",
    nombre: "Adrián Alejandro",
    apellido: "González Arévalo",
    fechaNacimiento: "1988-03-22",
    telefono: "11-5555-1111",
    direccion: "Av. Corrientes 1234, CABA",
    mail: "adrian.gonzalez@mail.com",
    desde: "2019-06-01",
    hasta: "2025-06-01",
    fechaBaja: "",
  },
  {
    id: 2,
    credencial: "7654321-02",
    plan: "Plan Básico",
    tipoDocumento: "DNI",
    numeroDocumento: "38999888",
    nombre: "Lucia Noemi",
    apellido: "Morelos Fernandez",
    fechaNacimiento: "1992-11-10",
    telefono: "11-5555-2222",
    direccion: "Calle Falsa 456, Buenos Aires",
    mail: "lucia.morelos@mail.com",
    desde: "2020-02-15",
    hasta: "2026-02-15",
    fechaBaja: "",
  },
  {
    id: 3,
    credencial: "9998887-03",
    plan: "Plan Familiar",
    tipoDocumento: "DNI",
    numeroDocumento: "37777111",
    nombre: "Carlos",
    apellido: "Pereyra",
    fechaNacimiento: "1985-07-08",
    telefono: "11-5555-3333",
    direccion: "San Martín 789, La Plata",
    mail: "carlos.pereyra@mail.com",
    desde: "2018-01-01",
    hasta: "2024-01-01",
    fechaBaja: "2023-12-31",
  },
  {
    id: 4,
    credencial: "1112223-04",
    plan: "Plan Premium",
    tipoDocumento: "DNI",
    numeroDocumento: "36666123",
    nombre: "Antony",
    apellido: "Rashford",
    fechaNacimiento: "1995-09-14",
    telefono: "11-5555-4444",
    direccion: "Belgrano 321, Rosario",
    mail: "antony.rashford@mail.com",
    desde: "2021-03-01",
    hasta: "2027-03-01",
    fechaBaja: "",
  },
];

// ---- Componente ----
const AfiliadoProfile: React.FC = () => {
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const encontrado = afiliados.find((a) => a.id === Number(id));
      if (encontrado) setAfiliado(encontrado);
      setLoading(false);
    }, 1000); // Simula 1 segundo de petición

    return () => clearTimeout(timer);
  }, [id]);

  const handleVolver = () => navigate("/afiliados");

  const handleDarDeBaja = () => {
    if (afiliado) {
      setAfiliado({ ...afiliado, fechaBaja: new Date().toISOString().split("T")[0] });
      alert("Afiliado dado de baja 🚫");
    }
  };

  // --- Render skeleton mientras carga ---
  if (loading) {
    return (
      <div className="admin-page">
        <Header title="Panel de Administración" subtitle="Afiliado - Información personal y estado" />
        <div className="admin-content">
          <HeaderAfiliado onVolver={handleVolver} />
          <div className="afiliado-form">
            {Array.from({ length: 12 }).map((_, i) => (
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

  // --- Render normal cuando ya se cargaron los datos ---
  return (
    <div className="admin-page">
      <Header
        title="Panel de Administración"
        subtitle="Afiliado - Información personal y estado"
      />
      <div className="admin-content">
        <HeaderAfiliado onVolver={handleVolver} />
        <div className="afiliado-form">
          <div className="form-row"><label>Credencial</label><span>{afiliado?.credencial}</span></div>
          <div className="form-row"><label>Plan médico</label><span>{afiliado?.plan}</span></div>
          <div className="form-row"><label>Tipo de documento</label><span>{afiliado?.tipoDocumento}</span></div>
          <div className="form-row"><label>Número de documento</label><span>{afiliado?.numeroDocumento}</span></div>
          <div className="form-row"><label>Nombre</label><span>{afiliado?.nombre}</span></div>
          <div className="form-row"><label>Apellido</label><span>{afiliado?.apellido}</span></div>
          <div className="form-row"><label>Fecha de nacimiento</label><span>{afiliado?.fechaNacimiento}</span></div>
          <div className="form-row"><label>Teléfono</label><span>{afiliado?.telefono}</span></div>
          <div className="form-row"><label>Dirección</label><span>{afiliado?.direccion}</span></div>
          <div className="form-row"><label>Mail</label><span>{afiliado?.mail}</span></div>
          <div className="form-row"><label>Desde</label><span>{afiliado?.desde}</span></div>
          <div className="form-row"><label>Hasta</label><span>{afiliado?.hasta}</span></div>

          <div className="form-row">
            <label>Fecha de baja</label>
            <span>{afiliado?.fechaBaja || "Activo"}</span>
            <Button variant="danger" type="button" onClick={handleDarDeBaja}>
              Dar de baja
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfiliadoProfile;
