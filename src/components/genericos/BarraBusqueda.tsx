// BarraBusqueda.tsx
import React from "react";
import { Search } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import "./BarraBusqueda.css";
import Select from "./Select";

interface BarraBusquedaProps {
    busqueda: string;
    setBusqueda: (value: string) => void;
}

const BarraBusqueda: React.FC<BarraBusquedaProps> = ({ busqueda, setBusqueda }) => {
    return (
        <div className="barra-busqueda">
            <div className="busqueda-header">
                <Search size={24} className="busqueda-icon" />
                <p className="busqueda-title">Búsqueda rápida</p>
            </div>

            <div className="busqueda-body">
                <Input
                    type="text"
                    placeholder="Ingrese su búsqueda"
                    value={busqueda}
                    onChange={setBusqueda}
                    variant="search"
                    icon={Search}
                />
               
            </div>
        </div>
    );
};

export default BarraBusqueda;

