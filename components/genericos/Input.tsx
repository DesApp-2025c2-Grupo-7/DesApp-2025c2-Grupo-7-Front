import React from "react";
import type { LucideIcon } from "lucide-react";
import "./Input.css";

interface InputProps {
    type?: "text" | "email" | "password" | "number" | "search" | "tel" | "url";
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    disabled?: boolean;
    required?: boolean;
    size?: "small" | "medium" | "large";
    variant?: "default" | "search";
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    className?: string;
    name?: string;
    id?: string;
    autoComplete?: string;
    maxLength?: number;
    minLength?: number;
    readOnly?: boolean;
}

const Input: React.FC<InputProps> = ({
    type = "text",
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    disabled = false,
    required = false,
    size = "medium",
    variant = "default",
    icon: Icon,
    iconPosition = "left",
    className = "",
    name,
    id,
    autoComplete,
    maxLength,
    minLength,
    readOnly = false
}) => {
    const baseClass = "input-wrapper";
    const sizeClass = `input-${size}`;
    const variantClass = `input-${variant}`;
    const disabledClass = disabled ? "input-disabled" : "";
    const iconClass = Icon ? `input-with-icon input-icon-${iconPosition}` : "";
    
    const wrapperClasses = [baseClass, sizeClass, variantClass, disabledClass, iconClass, className]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={wrapperClasses}>
            {Icon && iconPosition === "left" && (
                <Icon 
                    size={size === "small" ? 16 : size === "large" ? 24 : 20} 
                    className="input-icon input-icon-left" 
                />
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                disabled={disabled}
                required={required}
                name={name}
                id={id}
                autoComplete={autoComplete}
                maxLength={maxLength}
                minLength={minLength}
                readOnly={readOnly}
                className="input-field"
            />
            {Icon && iconPosition === "right" && (
                <Icon 
                    size={size === "small" ? 16 : size === "large" ? 24 : 20} 
                    className="input-icon input-icon-right" 
                />
            )}
        </div>
    );
};

export default Input;