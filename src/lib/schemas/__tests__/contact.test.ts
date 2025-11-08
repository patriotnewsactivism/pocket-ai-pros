import { describe, expect, it } from "vitest";

import { contactFormSchema } from "../contact";

describe("contactFormSchema", () => {
  it("accepts valid input", () => {
    const result = contactFormSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: "Analytical Engines",
      message: "I would like to learn more about your services.",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        name: "Ada Lovelace",
        email: "ada@example.com",
        company: "Analytical Engines",
        message: "I would like to learn more about your services.",
      });
    }
  });

  it("requires name and email", () => {
    const result = contactFormSchema.safeParse({
      name: "",
      email: "not-an-email",
      company: "",
      message: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Full name is required");
      expect(messages).toContain("Please enter a valid email address");
    }
  });
});
