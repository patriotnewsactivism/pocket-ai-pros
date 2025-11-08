import { describe, expect, it } from "vitest";

import { resellerApplicationSchema } from "../reseller";

describe("resellerApplicationSchema", () => {
  it("parses a valid application", () => {
    const result = resellerApplicationSchema.parse({
      name: "Jane Doe",
      email: "jane@example.com",
      company: "Acme Inc.",
      phone: "+1 (555) 123-4567",
      experience: "We manage dozens of SaaS clients.",
      expectedClients: 12,
    });

    expect(result).toStrictEqual({
      name: "Jane Doe",
      email: "jane@example.com",
      company: "Acme Inc.",
      phone: "+1 (555) 123-4567",
      experience: "We manage dozens of SaaS clients.",
      expectedClients: 12,
    });
  });

  it("rejects invalid expected client counts", () => {
    const result = resellerApplicationSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      company: "Acme Inc.",
      phone: "",
      experience: "",
      expectedClients: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.expectedClients).toContain(
        "Please estimate at least one client."
      );
    }
  });
});
