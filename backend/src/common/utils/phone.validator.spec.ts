import { validateSriLankaPhone, formatSriLankaPhone } from "./phone.validator";

describe("phone.validator", () => {
  describe("validateSriLankaPhone", () => {
    it("should validate 10-digit local phone numbers starting with 0", () => {
      expect(validateSriLankaPhone("0771234567")).toBe(true);
      expect(validateSriLankaPhone("0112345678")).toBe(true);
      expect(validateSriLankaPhone("071-9876543")).toBe(true);
    });

    it("should validate international numbers starting with +94 or 94", () => {
      expect(validateSriLankaPhone("+94771234567")).toBe(true);
      expect(validateSriLankaPhone("94771234567")).toBe(true);
      expect(validateSriLankaPhone("+94 77 123 4567")).toBe(true);
    });

    it("should return false for invalid phone numbers", () => {
      expect(validateSriLankaPhone("")).toBe(false);
      expect(validateSriLankaPhone("12345")).toBe(false);
      expect(validateSriLankaPhone("abcde")).toBe(false);
    });
  });

  describe("formatSriLankaPhone", () => {
    it("should format 077XXXXXXX to +9477XXXXXXX", () => {
      expect(formatSriLankaPhone("0771234567")).toBe("+94771234567");
    });

    it("should format 9477XXXXXXX to +9477XXXXXXX", () => {
      expect(formatSriLankaPhone("94771234567")).toBe("+94771234567");
    });

    it("should preserve already formatted +9477XXXXXXX", () => {
      expect(formatSriLankaPhone("+94771234567")).toBe("+94771234567");
    });

    it("should strip spaces and hyphens correctly", () => {
      expect(formatSriLankaPhone("077-123 4567")).toBe("+94771234567");
    });

    it("should return empty string for empty input", () => {
      expect(formatSriLankaPhone("")).toBe("");
    });
  });
});
