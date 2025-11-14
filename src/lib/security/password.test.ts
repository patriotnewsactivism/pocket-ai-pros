import { describe, expect, it } from "vitest";
import { evaluatePasswordStrength } from "@/lib/security/password";

describe("evaluatePasswordStrength", () => {
  it("flags missing requirements for weak passwords", () => {
    const result = evaluatePasswordStrength("abc");
    expect(result.isStrong).toBe(false);
    expect(result.suggestions).toContain("Include at least one uppercase letter.");
    expect(result.suggestions).toContain("Include at least one number.");
  });

  it("requires a minimum length", () => {
    const result = evaluatePasswordStrength("Abc123!@");
    expect(result.isStrong).toBe(false);
    expect(result.suggestions).toContain("Use at least 12 characters.");
  });

  it("treats complex passwords as strong", () => {
    const result = evaluatePasswordStrength("S0phisticated!Plan2024");
    expect(result.isStrong).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.suggestions).toHaveLength(0);
  });
});
