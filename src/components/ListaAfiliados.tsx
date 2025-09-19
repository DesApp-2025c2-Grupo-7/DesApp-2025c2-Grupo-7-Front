import React from "react";
import "./ListaAfiliados.css";
import LogoLapiz from "../assets/icons/logo-modificarAfiliado.svg";

interface Afiliado {
    id: number;
    nombre: string;
}

interface ListaAfiliadosProps {
    afiliados: Afiliado[];
}

const ListaAfiliados: React.FC<ListaAfiliadosProps> = ({ afiliados }) => {
    return (
        <div className="lista-afiliados">
            <h3>Resultados</h3>
            <ul>
                {afiliados.map((afiliado) => (
                    <li key={afiliado.id}>
                        <span className="nombre">{afiliado.nombre}</span>
                        <div className="acciones">
                            <button className="btn-vermas">+ Ver más</button>
                            <button className="btn-editar">
                                <img src={LogoLapiz} alt="Editar" className="icon-lapiz" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListaAfiliados;
