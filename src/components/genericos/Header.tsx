import React from "react";
import { Heart, Bell, User } from "lucide-react";
import Button from "./Button";
import "./Header.css";

interface HeaderProps {
    title: string;
    subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({
    title,
    subtitle
}) => {
    return (
        <header className="header">
            {/* Logo + títulos */}
            <div className="header-left">
                <div className="header-logo">
                    <Heart size={32} className="logo-icon" />
                </div>
                <div>
                    <h1 className="header-title">{title}</h1>
                    {subtitle && <p className="header-subtitle">{subtitle}</p>}
                </div>
            </div>

            {/* Iconos + botón salir */}
            <div className="header-right">
                <Button 
                    variant="secondary" 
                    size="small" 
                    icon={Bell} 
                    iconPosition="left" 
                    className="header-icon"
                >
                </Button>
                <Button 
                    variant="secondary" 
                    size="small" 
                    icon={User} 
                    iconPosition="left" 
                    className="header-icon"
                >
                </Button>
            </div>
        </header>
    );
};

export default Header;
