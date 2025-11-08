import React from "react";
import { ChevronDown } from "lucide-react";
import "./Select.css";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    size?: "small" | "medium" | "large";
    className?: string;
    name?: string;
    id?: string;
}

const Select: React.FC<SelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Seleccione una opción",
    disabled = false,
    size = "medium",
    className = "",
    name,
    id
}) => {
    const baseClass = "select-wrapper";
    const sizeClass = `select-${size}`;
    const disabledClass = disabled ? "select-disabled" : "";
    
    const wrapperClasses = [baseClass, sizeClass, disabledClass, className]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={wrapperClasses}>
            <select
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
                name={name}
                id={id}
                className="select-field"
            >
                {/* placeholder shown when value is empty but hidden from dropdown */}
                <option value="" hidden>
                    {placeholder}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown size={20} className="select-icon" />
        </div>
    );
};

export default Select;