import React from "react";
import type { LucideIcon } from "lucide-react";
import Button from "./Button";
import "./CardDashboard.css";

interface CardDashboardProps {
    title: string;
    buttonText: string;
    number: number | string;
    onButtonClick?: () => void;
    icon?: LucideIcon; // componente de icono de Lucide
}


const CardDashboard: React.FC<CardDashboardProps> = ({
    title,
    buttonText,
    number,
    onButtonClick,
    icon
}) => {
    return (
        <div className="card-dashboard">
            <div className="card-dashboard-header">
                {icon && React.createElement(icon, {
                    size: 24,
                    className: "card-dashboard-icon"
                })}
                <h3>{title}</h3>
            </div>

            <Button variant="primary" onClick={onButtonClick}>
                {buttonText}
            </Button>

            <span className="card-dashboard-number">{number}</span>
        </div>
    );
};

export default CardDashboard;
