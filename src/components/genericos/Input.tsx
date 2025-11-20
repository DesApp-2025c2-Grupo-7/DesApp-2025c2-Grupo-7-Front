import React, { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import "./Input.css";
import { validarCampo, getMaxLengthForValidationType, type TipoValidacion } from "../../utils/validaciones";

interface InputProps {
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "search"
    | "tel"
    | "url"
    | "date"
    | "time";
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
  validationType?: TipoValidacion;
  showValidation?: boolean;
  hideErrorMessage?: boolean;
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
  readOnly = false,
  validationType = "none",
  showValidation = true,
  hideErrorMessage = false,
}) => {
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>();

  // Determinar maxLength automáticamente según el tipo de validación
  const effectiveMaxLength = maxLength ?? getMaxLengthForValidationType(validationType);

  // Validar en tiempo real cuando el valor cambia
  useEffect(() => {
    if (showValidation && validationType !== "none" && value !== undefined && touched) {
      const result = validarCampo(value, validationType, required);
      setValidationError(result.isValid ? undefined : result.error);
    }
  }, [value, validationType, required, showValidation, touched]);

  const handleBlur = () => {
    setTouched(true);
    if (showValidation && validationType !== "none" && value !== undefined) {
      const result = validarCampo(value, validationType, required);
      setValidationError(result.isValid ? undefined : result.error);
    }
    onBlur?.();
  };

  const handleChange = (newValue: string) => {
    // Validar en tiempo real mientras el usuario escribe
    if (showValidation && validationType !== "none" && touched) {
      const result = validarCampo(newValue, validationType, required);
      setValidationError(result.isValid ? undefined : result.error);
    }
    onChange?.(newValue);
  };

  const hasError = showValidation && touched && validationError;

  const baseClass = "input-wrapper";
  const sizeClass = `input-${size}`;
  const variantClass = `input-${variant}`;
  const disabledClass = disabled ? "input-disabled" : "";
  const iconClass = Icon ? `input-with-icon input-icon-${iconPosition}` : "";
  const errorClass = hasError ? "input-error" : "";

  const wrapperClasses = [
    baseClass,
    sizeClass,
    variantClass,
    disabledClass,
    iconClass,
    errorClass,
    className,
  ]
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
        onChange={(e) => handleChange(e.target.value)}
        onFocus={onFocus}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        autoComplete={autoComplete}
        maxLength={effectiveMaxLength}
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
      {hasError && !hideErrorMessage && (
        <span className="input-error-message">{validationError}</span>
      )}
    </div>
  );
};

export default Input;
