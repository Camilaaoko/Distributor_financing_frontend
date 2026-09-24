export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidBusinessEmail(value: string): boolean {
  const freeProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  if (!isValidEmail(value)) return false;
  const domain = value.split('@')[1]?.toLowerCase();
  return !freeProviders.includes(domain);
}

export function isStrongPassword(value: string): boolean {
  // At least 8 chars, one letter and one number.
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);
}

export function isValidTaxId(value: string): boolean {
  // Loose EIN-style check: XX-XXXXXXX
  return /^\d{2}-\d{7}$/.test(value);
}

export function hasMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function hasSpecialChar(value: string): boolean {
  return /[^A-Za-z0-9]/.test(value);
}

export function getPasswordRequirements(password: string) {
  return {
    minLength: hasMinLength(password, 8),
    specialChar: hasSpecialChar(password),
  };
}
