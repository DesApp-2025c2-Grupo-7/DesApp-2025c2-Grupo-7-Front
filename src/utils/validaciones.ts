/**
 * Utilidades de validación para formularios
 * Validaciones en tiempo real con mensajes específicos
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valida que el nombre o apellido no esté vacío
 * Sin restricciones adicionales
 */
export const validarNombreApellido = (valor: string): ValidationResult => {
  if (!valor || valor.trim() === '') {
    return { isValid: false, error: 'Campo requerido' };
  }
  return { isValid: true };
};

/**
 * Valida DNI: entre 7 y 8 dígitos numéricos
 */
export const validarDNI = (valor: string): ValidationResult => {
  if (!valor || valor.trim() === '') {
    return { isValid: false, error: 'Campo requerido' };
  }
  
  // Solo números
  if (!/^\d+$/.test(valor)) {
    return { isValid: false, error: 'Solo se permiten números' };
  }
  
  // Entre 7 y 8 dígitos
  if (valor.length < 7) {
    return { isValid: false, error: 'Debe tener entre 7 y 8 dígitos' };
  }
  
  if (valor.length > 8) {
    return { isValid: false, error: 'Debe tener entre 7 y 8 dígitos' };
  }
  
  return { isValid: true };
};

/**
 * Valida CUIL/CUIT: debe tener exactamente 11 dígitos SIN guiones
 */
export const validarCUILCUIT = (valor: string): ValidationResult => {
  if (!valor || valor.trim() === '') {
    return { isValid: false, error: 'Campo requerido' };
  }
  
  // Verificar que no tenga guiones
  if (valor.includes('-')) {
    return { isValid: false, error: 'No debe contener guiones (-)' };
  }
  
  // Solo números
  if (!/^\d+$/.test(valor)) {
    return { isValid: false, error: 'Solo se permiten números' };
  }
  
  // Exactamente 11 dígitos
  if (valor.length !== 11) {
    return { isValid: false, error: 'Debe tener exactamente 11 dígitos' };
  }
  
  return { isValid: true };
};

/**
 * Valida formato de email
 */
export const validarEmail = (valor: string): ValidationResult => {
  if (!valor || valor.trim() === '') {
    return { isValid: false, error: 'Campo requerido' };
  }
  
  // Patrón básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(valor)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }
  
  return { isValid: true };
};

/**
 * Valida teléfono: debe tener exactamente 10 dígitos
 */
export const validarTelefono = (valor: string): ValidationResult => {
  if (!valor || valor.trim() === '') {
    return { isValid: false, error: 'Campo requerido' };
  }
  
  // Solo números
  if (!/^\d+$/.test(valor)) {
    return { isValid: false, error: 'Solo se permiten números' };
  }
  
  // Exactamente 10 dígitos
  if (valor.length !== 10) {
    return { isValid: false, error: 'Debe tener exactamente 10 dígitos' };
  }
  
  return { isValid: true };
};

/**
 * Valida código postal: entre 1 y 4 dígitos
 */
export const validarCodigoPostal = (valor: string): ValidationResult => {
  if (!valor || valor.trim() === '') {
    return { isValid: false, error: 'Campo requerido' };
  }
  
  // Solo números
  if (!/^\d+$/.test(valor)) {
    return { isValid: false, error: 'Solo se permiten números' };
  }
  
  // Entre 1 y 4 dígitos
  if (valor.length > 4) {
    return { isValid: false, error: 'Máximo 4 dígitos' };
  }
  
  return { isValid: true };
};

/**
 * Valida altura de dirección: entre 1 y 6 dígitos
 */
export const validarAltura = (valor: string): ValidationResult => {
  if (!valor || valor.trim() === '') {
    return { isValid: false, error: 'Campo requerido' };
  }
  
  // Solo números
  if (!/^\d+$/.test(valor)) {
    return { isValid: false, error: 'Solo se permiten números' };
  }
  
  // Entre 1 y 6 dígitos
  if (valor.length > 6) {
    return { isValid: false, error: 'Máximo 6 dígitos' };
  }
  
  return { isValid: true };
};

/**
 * Valida campo requerido genérico
 */
export const validarRequerido = (valor: string): ValidationResult => {
  if (!valor || valor.trim() === '') {
    return { isValid: false, error: 'Campo requerido' };
  }
  return { isValid: true };
};

/**
 * Tipo de validación disponible
 */
export type TipoValidacion = 
  | 'nombre'
  | 'apellido'
  | 'dni'
  | 'cuil-cuit'
  | 'email'
  | 'telefono'
  | 'codigoPostal'
  | 'altura'
  | 'requerido'
  | 'none';

/**
 * Ejecuta la validación según el tipo especificado
 */
export const validarCampo = (valor: string, tipo: TipoValidacion, esRequerido: boolean = false): ValidationResult => {
  // Si el campo no es requerido y está vacío, es válido
  if (!esRequerido && (!valor || valor.trim() === '')) {
    return { isValid: true };
  }
  
  switch (tipo) {
    case 'nombre':
    case 'apellido':
      return validarNombreApellido(valor);
    case 'dni':
      return validarDNI(valor);
    case 'cuil-cuit':
      return validarCUILCUIT(valor);
    case 'email':
      return validarEmail(valor);
    case 'telefono':
      return validarTelefono(valor);
    case 'codigoPostal':
      return validarCodigoPostal(valor);
    case 'altura':
      return validarAltura(valor);
    case 'requerido':
      return validarRequerido(valor);
    case 'none':
      return { isValid: true };
    default:
      return { isValid: true };
  }
};

/**
 * Retorna el maxLength según el tipo de validación
 */
export const getMaxLengthForValidationType = (tipo: TipoValidacion): number | undefined => {
  switch (tipo) {
    case 'dni':
      return 8;
    case 'cuil-cuit':
      return 11;
    case 'telefono':
      return 10;
    case 'codigoPostal':
      return 4;
    case 'altura':
      return 6;
    default:
      return undefined;
  }
};

// Made with Bob
