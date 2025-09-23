import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import "./Paginacion.css";

interface PaginacionProps {
    totalPages: number;
}

const Paginacion: React.FC<PaginacionProps> = ({ totalPages }) => {
    return (
        <div className="paginacion">
            <Button variant="secondary" size="small" icon={ChevronLeft} className="arrow-btn" />
            {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} variant="secondary" size="small" className="page-btn">
                    {i + 1}
                </Button>
            ))}
            <Button variant="secondary" size="small" icon={ChevronRight} className="arrow-btn" />
        </div>
    );
};

export default Paginacion;
