import { validateSriLankaNIC, parseNICMetadata } from './nic.validator';

describe('nic.validator', () => {
  describe('validateSriLankaNIC', () => {
    it('should return true for valid old format NICs (9 digits + V/X)', () => {
      expect(validateSriLankaNIC('951234567V')).toBe(true);
      expect(validateSriLankaNIC('881234567x')).toBe(true); // lowercase 'x' handles upper-casing
    });

    it('should return true for valid new format NICs (12 digits)', () => {
      expect(validateSriLankaNIC('199512345678')).toBe(true);
      expect(validateSriLankaNIC('200156789012')).toBe(true);
    });

    it('should return false for invalid NIC strings', () => {
      expect(validateSriLankaNIC('')).toBe(false);
      expect(validateSriLankaNIC('12345')).toBe(false);
      expect(validateSriLankaNIC('9512345678V')).toBe(false);
      expect(validateSriLankaNIC('INVALID_NIC')).toBe(false);
    });
  });

  describe('parseNICMetadata', () => {
    it('should extract correct birth year and gender for Old NIC (Male)', () => {
      const result = parseNICMetadata('951234567V');
      expect(result).not.toBeNull();
      expect(result).toEqual({
        birthYear: 1995,
        isFemale: false, // dayCode = 123 <= 500
      });
    });

    it('should extract correct birth year and gender for Old NIC (Female)', () => {
      const result = parseNICMetadata('956234567V');
      expect(result).not.toBeNull();
      expect(result).toEqual({
        birthYear: 1995,
        isFemale: true, // dayCode = 623 > 500
      });
    });

    it('should extract correct birth year and gender for New NIC (Male)', () => {
      const result = parseNICMetadata('200115012345');
      expect(result).not.toBeNull();
      expect(result).toEqual({
        birthYear: 2001,
        isFemale: false, // dayCode = 150 <= 500
      });
    });

    it('should extract correct birth year and gender for New NIC (Female)', () => {
      const result = parseNICMetadata('199865012345');
      expect(result).not.toBeNull();
      expect(result).toEqual({
        birthYear: 1998,
        isFemale: true, // dayCode = 650 > 500
      });
    });

    it('should return null for invalid NIC', () => {
      expect(parseNICMetadata('INVALID')).toBeNull();
    });
  });
});
