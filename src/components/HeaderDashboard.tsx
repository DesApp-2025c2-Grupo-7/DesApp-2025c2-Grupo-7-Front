import React from "react";
import "./HeaderDashboard.css";
import LogoMedicinaIntegral from "../assets/icons/Logo-medicinaIntegral.svg";
import LogoUsuario from "../assets/icons/logo-usuario.svg";
import LogoNotificacion from "../assets/icons/logo-notificacion.svg";



interface HeaderDashboardProps {
    title: string;
    subtitle?: string;
}

const HeaderDashboard: React.FC<HeaderDashboardProps> = ({
    title,
    subtitle
}) => {
    return (
        <header className="header-dashboard">
            {/* Logo + títulos */}
            <div className="header-dashboard-left">
                <img
                    src={LogoMedicinaIntegral}
                    alt="Logo Medicina Integral"
                    className="header-dashboard-logo"
                />
                <div>
                    <h1 className="header-dashboard-title">{title}</h1>
                    {subtitle && <p className="header-dashboard-subtitle">{subtitle}</p>}
                </div>
            </div>

            {/* Iconos + botón salir */}
            <div className="header-dashboard-right">
                <button className="header-dashboard-icon" title="Notificaciones">
                    <img
                        src={LogoNotificacion}
                        alt="Notificaciones"
                        className="header-dashboard-icon-img"
                    />
                </button>
                <button className="header-dashboard-icon" title="Perfil">
                    <img
                        src={LogoUsuario}
                        alt="Usuario"
                        className="header-dashboard-icon-img"
                    />
                </button>
            </div>
        </header>
    );
};

export default HeaderDashboard;
