import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import "./Paginacion.css";

interface PaginacionProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Paginacion: React.FC<PaginacionProps> = ({ totalPages, currentPage, onPageChange }) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="paginacion">
      <Button
        variant="secondary"
        size="small"
        icon={ChevronLeft}
        className="arrow-btn"
        onClick={handlePrev}
        disabled={currentPage === 1}
      />
      {Array.from({ length: totalPages }, (_, i) => (
        <Button
          key={i}
          variant={i + 1 === currentPage ? "primary" : "secondary"}
          size="small"
          className={`page-btn ${i + 1 === currentPage ? "active" : ""}`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </Button>
      ))}
      <Button
        variant="secondary"
        size="small"
        icon={ChevronRight}
        className="arrow-btn"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      />
    </div>
  );
};

export default Paginacion;