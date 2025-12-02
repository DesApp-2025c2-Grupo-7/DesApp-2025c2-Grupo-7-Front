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

    // NUEVO
    searchByCodigoPostal: boolean;
    setSearchByCodigoPostal: (v: boolean) => void;

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

    // NUEVO
    searchByCodigoPostal: boolean;
    setSearchByCodigoPostal: (v: boolean) => void;

    onlyProfesionales: boolean;
    setOnlyProfesionales: (v: boolean) => void;

    onlyCentros: boolean;
    setOnlyCentros: (v: boolean) => void;

    includeBajas: boolean;
    setIncludeBajas: (v: boolean) => void;
}

type BarraBusquedaProps =
    | BarraBusquedaAfiliadosProps
    | BarraBusquedaPrestadoresProps;



const BarraBusqueda: React.FC<BarraBusquedaProps> = (props) => {
    const { mode, busqueda, setBusqueda } = props;

    // ================================
    // FILTROS PARA AFILIADOS
    // ================================
    const renderFiltrosAfiliados = (p: BarraBusquedaAfiliadosProps) => (
        <div className="busqueda-filtros-inline">

            <label>
                <input
                    type="checkbox"
                    checked={p.searchByNombre}
                    onChange={(e) => p.setSearchByNombre(e.target.checked)}
                />
                Nombre
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.searchByApellido}
                    onChange={(e) => p.setSearchByApellido(e.target.checked)}
                />
                Apellido
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.searchByCredencial}
                    onChange={(e) => p.setSearchByCredencial(e.target.checked)}
                />
                Credencial
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.searchByDni}
                    onChange={(e) => p.setSearchByDni(e.target.checked)}
                />
                DNI
            </label>

            {/* NUEVO */}
            <label>
                <input
                    type="checkbox"
                    checked={p.searchByCodigoPostal}
                    onChange={(e) => p.setSearchByCodigoPostal(e.target.checked)}
                />
                Cód. Postal
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.onlyTitulares}
                    onChange={(e) => p.setOnlyTitulares(e.target.checked)}
                />
                Solo Titulares
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.includeInactivos}
                    onChange={(e) => p.setIncludeInactivos(e.target.checked)}
                />
                Incluir Inactivos
            </label>
        </div>
    );

    // ================================
    // FILTROS PARA PRESTADORES
    // ================================
    const renderFiltrosPrestadores = (p: BarraBusquedaPrestadoresProps) => (
        <div className="busqueda-filtros-inline">

            <label>
                <input
                    type="checkbox"
                    checked={p.searchByNombre}
                    onChange={(e) => p.setSearchByNombre(e.target.checked)}
                />
                Nombre
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.searchByCuil}
                    onChange={(e) => p.setSearchByCuil(e.target.checked)}
                />
                CUIL/CUIT
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.searchByEspecialidad}
                    onChange={(e) => p.setSearchByEspecialidad(e.target.checked)}
                />
                Especialidad
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.searchByLocalidad}
                    onChange={(e) => p.setSearchByLocalidad(e.target.checked)}
                />
                Localidad
            </label>

            {/* NUEVO */}
            <label>
                <input
                    type="checkbox"
                    checked={p.searchByCodigoPostal}
                    onChange={(e) => p.setSearchByCodigoPostal(e.target.checked)}
                />
                Cód. Postal
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.onlyProfesionales}
                    onChange={(e) => {
                        p.setOnlyProfesionales(e.target.checked);
                        if (e.target.checked) p.setOnlyCentros(false);
                    }}
                />
                Solo Profesionales
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.onlyCentros}
                    onChange={(e) => {
                        p.setOnlyCentros(e.target.checked);
                        if (e.target.checked) p.setOnlyProfesionales(false);
                    }}
                />
                Solo Centros
            </label>

            <label>
                <input
                    type="checkbox"
                    checked={p.includeBajas}
                    onChange={(e) => p.setIncludeBajas(e.target.checked)}
                />
                Incluir Bajas
            </label>
        </div>
    );

    const titulo =
        mode === "afiliados"
            ? "Búsqueda rápida de afiliados"
            : "Búsqueda rápida de prestadores";

    const placeholder =
        mode === "afiliados"
            ? "Buscar afiliados..."
            : "Buscar prestadores...";

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

                {mode === "afiliados" &&
                    renderFiltrosAfiliados(props as BarraBusquedaAfiliadosProps)}

                {mode === "prestadores" &&
                    renderFiltrosPrestadores(props as BarraBusquedaPrestadoresProps)}
            </div>
        </div>
    );
};

export default BarraBusqueda;
