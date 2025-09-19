import React from "react";
import "./Paginacion.css";

interface PaginacionProps {
    totalPages: number;
}

const Paginacion: React.FC<PaginacionProps> = ({ totalPages }) => {
    return (
        <div className="paginacion">
            <button className="arrow-btn">&larr;</button>
            {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className="page-btn">
                    {i + 1}
                </button>
            ))}
            <button className="arrow-btn">&rarr;</button>
        </div>
    );
};

export default Paginacion;
