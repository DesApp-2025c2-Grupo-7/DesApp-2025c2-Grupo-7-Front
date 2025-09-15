import React from "react";
import "./CardDashboard.css";

interface CardDashboardProps {
    title: string;
    buttonText: string;
    number: number | string;
    onButtonClick?: () => void;
    icon?: string; // ruta del icono
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
                {icon && (
                    <img
                        src={icon}
                        alt={`${title} icon`}
                        className="card-dashboard-icon-img"
                    />
                )}
                <h3>{title}</h3>
            </div>

            <button className="card-dashboard-button" onClick={onButtonClick}>
                {buttonText}
            </button>

            <span className="card-dashboard-number">{number}</span>
        </div>
    );
};

export default CardDashboard;
