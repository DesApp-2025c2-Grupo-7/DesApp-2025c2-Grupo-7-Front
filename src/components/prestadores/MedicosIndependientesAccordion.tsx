import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./MedicosIndependientesAccordion.css";

interface AccordionGenericoProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const MedicosIndependientesAccordion: React.FC<AccordionGenericoProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="grupo-familiar-accordion">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="accordion-title">
          {icon}
          <h4>{title}</h4>
        </div>

        <div className="accordion-toggle">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

export default MedicosIndependientesAccordion;
