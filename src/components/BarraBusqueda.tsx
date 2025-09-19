// BarraBusqueda.tsx
import React from "react";
import "./BarraBusqueda.css";
import LogoLupa from "../assets/icons/logo-busquedaRapida.svg";

interface BarraBusquedaProps {
    busqueda: string;
    setBusqueda: (value: string) => void;
}

const BarraBusqueda: React.FC<BarraBusquedaProps> = ({ busqueda, setBusqueda }) => {
    return (
        <div className="barra-busqueda">
            <div className="busqueda-header">
                <img src={LogoLupa} alt="Lupa" className="busqueda-icon" />
                <p className="busqueda-title">Búsqueda rápida</p>
            </div>

            <div className="busqueda-body">
                <input
                    type="text"
                    placeholder="Ingrese su búsqueda"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <button className="btn btn-primary">Buscar</button>

                <select>
                    <option>Selecciona una opción</option>
                    <option>Opción 1</option>
                </select>
                <select>
                    <option>Selecciona una opción</option>
                    <option>Opción 2</option>
                </select>
            </div>
        </div>
    );
};

export default BarraBusqueda;
