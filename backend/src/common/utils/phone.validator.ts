/**
 * Sri Lankan Mobile & Landline Phone Number Validator & Formatter
 * Valid formats:
 * - Local 10 digits starting with 0: e.g. 0771234567, 0112345678
 * - International starting with +94: e.g. +94771234567
 * - Plain international without plus: e.g. 94771234567
 */
export function validateSriLankaPhone(phone: string): boolean {
  if (!phone) return false;
  const cleanPhone = phone.trim().replace(/[\s-]/g, '');

  const slPhoneRegex = /^(?:\+94|94|0)?7[0-9]{8}$|^(?:\+94|94|0)?[1-9][0-9]{8}$/;
  return slPhoneRegex.test(cleanPhone);
}

/**
 * Standardizes Sri Lanka phone number to E.164 international format (+9477XXXXXXX)
 */
export function formatSriLankaPhone(phone: string): string {
  if (!phone) return '';
  let cleanPhone = phone.trim().replace(/[\s-]/g, '');

  if (cleanPhone.startsWith('0')) {
    cleanPhone = '+94' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('94')) {
    cleanPhone = '+' + cleanPhone;
  } else if (!cleanPhone.startsWith('+')) {
    cleanPhone = '+94' + cleanPhone;
  }

  return cleanPhone;
}
