// BarraBusqueda.tsx
import React from "react";
import { Search } from "lucide-react";
import Input from "./Input";
import "./BarraBusqueda.css";

interface BarraBusquedaAfiliadosProps {
    mode: "afiliados";
    busqueda: string;
    setBusqueda: (value: string) => void;
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

interface BarraBusquedaPrestadoresProps {
    mode: "prestadores";
    busqueda: string;
    setBusqueda: (value: string) => void;
    searchByNombre: boolean;
    setSearchByNombre: (v: boolean) => void;
    searchByCuil: boolean;
    setSearchByCuil: (v: boolean) => void;
    searchByEspecialidad: boolean;
    setSearchByEspecialidad: (v: boolean) => void;
    searchByLocalidad: boolean;
    setSearchByLocalidad: (v: boolean) => void;
    onlyProfesionales: boolean;
    setOnlyProfesionales: (v: boolean) => void;
    onlyCentros: boolean;
    setOnlyCentros: (v: boolean) => void;
    includeBajas: boolean;
    setIncludeBajas: (v: boolean) => void;
}

type BarraBusquedaProps = BarraBusquedaAfiliadosProps | BarraBusquedaPrestadoresProps;

const BarraBusqueda: React.FC<BarraBusquedaProps> = (props) => {
    const { mode, busqueda, setBusqueda } = props;

    const renderFiltrosAfiliados = (props: BarraBusquedaAfiliadosProps) => (
        <div className="busqueda-filtros-inline">
            <label>
                <input
                    type="checkbox"
                    checked={props.searchByNombre}
                    onChange={(e) => props.setSearchByNombre(e.target.checked)}
                />
                Nombre
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.searchByApellido}
                    onChange={(e) => props.setSearchByApellido(e.target.checked)}
                />
                Apellido
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.searchByCredencial}
                    onChange={(e) => props.setSearchByCredencial(e.target.checked)}
                />
                Cred.
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.searchByDni}
                    onChange={(e) => props.setSearchByDni(e.target.checked)}
                />
                DNI
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.onlyTitulares}
                    onChange={(e) => props.setOnlyTitulares(e.target.checked)}
                />
                Solo Titulares
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.includeInactivos}
                    onChange={(e) => props.setIncludeInactivos(e.target.checked)}
                />
                Mostrar Inactivos
            </label>
        </div>
    );

    const renderFiltrosPrestadores = (props: BarraBusquedaPrestadoresProps) => (
        <div className="busqueda-filtros-inline">
            <label>
                <input
                    type="checkbox"
                    checked={props.searchByNombre}
                    onChange={(e) => props.setSearchByNombre(e.target.checked)}
                />
                Nombre
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.searchByCuil}
                    onChange={(e) => props.setSearchByCuil(e.target.checked)}
                />
                CUIL/CUIT
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.searchByEspecialidad}
                    onChange={(e) => props.setSearchByEspecialidad(e.target.checked)}
                />
                Especialidad
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.searchByLocalidad}
                    onChange={(e) => props.setSearchByLocalidad(e.target.checked)}
                />
                Localidad
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.onlyProfesionales}
                    onChange={(e) => {
                        props.setOnlyProfesionales(e.target.checked);
                        if (e.target.checked) props.setOnlyCentros(false);
                    }}
                />
                Solo Profesionales
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.onlyCentros}
                    onChange={(e) => {
                        props.setOnlyCentros(e.target.checked);
                        if (e.target.checked) props.setOnlyProfesionales(false);
                    }}
                />
                Solo Centros
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={props.includeBajas}
                    onChange={(e) => props.setIncludeBajas(e.target.checked)}
                />
                Incluir Bajas
            </label>
        </div>
    );

    const titulo = mode === "afiliados" ? "Búsqueda rápida de afiliados" : "Búsqueda rápida de prestadores";
    const placeholder = mode === "afiliados" ? "Buscar afiliados..." : "Buscar prestadores...";

    return (
        <div className="barra-busqueda">
            <div className="busqueda-header">
                <Search size={24} className="busqueda-icon" />
                <p className="busqueda-title">{titulo}</p>
            </div>

            <div className="busqueda-body">
                <div className="busqueda-contenedor-input">
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={busqueda}
                        onChange={setBusqueda}
                        variant="search"
                        icon={Search}
                    />
                </div>

                {mode === "afiliados" && renderFiltrosAfiliados(props as BarraBusquedaAfiliadosProps)}
                {mode === "prestadores" && renderFiltrosPrestadores(props as BarraBusquedaPrestadoresProps)}
            </div>
        </div>
    );
};

export default BarraBusqueda;