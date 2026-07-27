/**
 * Sri Lanka National Identity Card (NIC) Validator
 * Supports:
 * 1. Old NIC format: 9 digits followed by 'V' or 'X' (e.g. 951234567V / 881234567X)
 * 2. New NIC format: 12 digits (e.g. 199512345678)
 */
export function validateSriLankaNIC(nic: string): boolean {
  if (!nic) return false;
  const cleanNic = nic.trim().toUpperCase();

  const oldNicRegex = /^[0-9]{9}[VX]$/;
  const newNicRegex = /^[0-9]{12}$/;

  return oldNicRegex.test(cleanNic) || newNicRegex.test(cleanNic);
}

/**
 * Extracts Birth Year and Gender from Sri Lankan NIC
 */
export function parseNICMetadata(
  nic: string,
): { birthYear: number; isFemale: boolean } | null {
  if (!validateSriLankaNIC(nic)) return null;
  const cleanNic = nic.trim().toUpperCase();

  let yearStr = "";
  let dayCode = 0;

  if (cleanNic.length === 10) {
    // Old NIC: First 2 digits = Year (e.g. "95" -> 1995)
    yearStr = "19" + cleanNic.substring(0, 2);
    dayCode = parseInt(cleanNic.substring(2, 5), 10);
  } else {
    // New NIC: First 4 digits = Year (e.g. "1995")
    yearStr = cleanNic.substring(0, 4);
    dayCode = parseInt(cleanNic.substring(4, 7), 10);
  }

  const isFemale = dayCode > 500;
  return {
    birthYear: parseInt(yearStr, 10),
    isFemale,
  };
}
