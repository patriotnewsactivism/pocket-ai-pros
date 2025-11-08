import { describe, expect, it } from "vitest";

import { resellerApplicationSchema } from "../reseller";

describe("resellerApplicationSchema", () => {
  it("accepts valid input", () => {
    const result = resellerApplicationSchema.safeParse({
      name: "Taylor",
      email: "taylor@example.com",
      company: "Taylor Co",
      phone: "+1 555-1234",
      experience: "Years of SaaS sales experience.",
      expectedClients: "5",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        name: "Taylor",
        email: "taylor@example.com",
        company: "Taylor Co",
        expectedClients: "5",
      });
    }
  });

  it("rejects invalid expected client counts", () => {
    const result = resellerApplicationSchema.safeParse({
      name: "Taylor",
      email: "taylor@example.com",
      company: "Taylor Co",
      phone: "",
      experience: "",
      expectedClients: "-1",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Expected clients must be a positive number");
    }
  });
});
