// BarraBusqueda.tsx
import React from "react";
import { Search } from "lucide-react";
import Input from "./Input";
import "./BarraBusqueda.css";
// Select is not used here; filters are inline checkboxes

interface BarraBusquedaProps {
    busqueda: string;
    setBusqueda: (value: string) => void;
    // filtros inline
    searchByNombre: boolean;
    setSearchByNombre: (v: boolean) => void;
    searchByApellido: boolean;
    setSearchByApellido: (v: boolean) => void;
    searchByCredencial: boolean;
    setSearchByCredencial: (v: boolean) => void;
    searchByDni: boolean;
    setSearchByDni: (v: boolean) => void;
    onlyTitulares: boolean;
    setOnlyTitulares: (v: boolean) => void;
    includeInactivos: boolean;
    setIncludeInactivos: (v: boolean) => void;
}

const BarraBusqueda: React.FC<BarraBusquedaProps> = ({ busqueda, setBusqueda, searchByNombre, setSearchByNombre, searchByApellido, setSearchByApellido, searchByCredencial, setSearchByCredencial, searchByDni, setSearchByDni, onlyTitulares, setOnlyTitulares, includeInactivos, setIncludeInactivos }) => {
    return (
        <div className="barra-busqueda">
            <div className="busqueda-header">
                <Search size={24} className="busqueda-icon" />
                <p className="busqueda-title">Búsqueda rápida</p>
            </div>

            <div className="busqueda-body">
                <div className="busqueda-contenedor-input">
                    <Input
                        type="text"
                        placeholder="Ingrese su búsqueda"
                        value={busqueda}
                        onChange={setBusqueda}
                        variant="search"
                        icon={Search}
                    />
                </div>

                <div className="busqueda-filtros-inline">
                    <label><input type="checkbox" checked={searchByNombre} onChange={e=>setSearchByNombre(e.target.checked)} />Nombre</label>
                    <label><input type="checkbox" checked={searchByApellido} onChange={e=>setSearchByApellido(e.target.checked)} />Apellido</label>
                    <label><input type="checkbox" checked={searchByCredencial} onChange={e=>setSearchByCredencial(e.target.checked)} />Cred.</label>
                    <label><input type="checkbox" checked={searchByDni} onChange={e=>setSearchByDni(e.target.checked)} />DNI</label>
                    <label><input type="checkbox" checked={onlyTitulares} onChange={e=>setOnlyTitulares(e.target.checked)} />Solo Titulares</label>
                    <label><input type="checkbox" checked={includeInactivos} onChange={e=>setIncludeInactivos(e.target.checked)} />Mostrar Inactivos</label>
                </div>
            </div>
        </div>
    );
};

export default BarraBusqueda;

