import React from "react";
import { Heart} from "lucide-react";

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

        </header>
    );
};

export default Header;
