import React from "react";
import "./DashboardNavbar.css"; // usa tu CSS original
import LogoMedicinaIntegral from "../assets/icons/Logo-medicinaIntegral.svg";
import LogoUsuario from "../assets/icons/logo-usuario.svg";
import LogoNotificacion from "../assets/icons/logo-notificacion.svg";

interface DashboardNavbarProps {
    onNotificationClick?: () => void;
    onProfileClick?: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
    onNotificationClick,
    onProfileClick,
}) => {
    return (
        <header className="header-dashboard">
            {/* Logo + títulos */}
            <div className="header-dashboard-left">
                <img
                    src={LogoMedicinaIntegral}
                    alt="Medicina Integral"
                    className="header-dashboard-logo"
                />
                <div>
                    <h1 className="header-dashboard-title">Panel de administración</h1>
                    <p className="header-dashboard-subtitle">
                        Gestión del sistema Medicina Integral
                    </p>
                </div>
            </div>

            {/* Iconos */}
            <div className="header-dashboard-right">
                <button
                    className="header-dashboard-icon"
                    title="Notificaciones"
                    onClick={onNotificationClick}
                >
                    <img
                        src={LogoNotificacion}
                        alt="Notificaciones"
                        className="header-dashboard-icon-img"
                    />
                </button>
                <button
                    className="header-dashboard-icon"
                    title="Perfil"
                    onClick={onProfileClick}
                >
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

export default DashboardNavbar;
