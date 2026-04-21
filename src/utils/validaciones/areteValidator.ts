export interface ValidationResult {
  valid: boolean;
  errorMsg: string | null;
}

const ARETE_REGEX = /^[1-9]\d{9}$/;

export const validateArete = (arete: string): ValidationResult => {
  const value = arete.trim();

  if (value.length === 0) {
    return {
      valid: false,
      errorMsg: 'El numero de arete es obligatorio.',
    };
  }

  if (!ARETE_REGEX.test(value)) {
    return {
      valid: false,
      errorMsg: 'El arete debe tener 10 digitos y no puede iniciar en 0.',
    };
  }

  return {
    valid: true,
    errorMsg: null,
  };
};
