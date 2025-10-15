import React from "react";
import type { LucideIcon } from "lucide-react";
import "./Button.css";

interface ButtonProps {
    children?: React.ReactNode;
    variant?: "primary" | "secondary" | "accent" | "back" | "danger" | "cancel";
    size?: "small" | "medium" | "large";
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "medium",
    onClick,
    disabled = false,
    type = "button",
    icon: Icon,
    iconPosition = "left",
    className = ""
}) => {
    const baseClass = "btn";
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const disabledClass = disabled ? "btn-disabled" : "";
    
    const classes = [baseClass, variantClass, sizeClass, disabledClass, className]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled}
        >
            {Icon && iconPosition === "left" && (
                <Icon size={size === "small" ? 16 : size === "large" ? 24 : 20} className="btn-icon btn-icon-left" />
            )}
            {children && <span className="btn-text">{children}</span>}
            {Icon && iconPosition === "right" && (
                <Icon size={size === "small" ? 16 : size === "large" ? 24 : 20} className="btn-icon btn-icon-right" />
            )}
        </button>
    );
};

export default Button;