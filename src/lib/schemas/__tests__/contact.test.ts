import { describe, expect, it } from "vitest";

import { contactFormSchema } from "../contact";

describe("contactFormSchema", () => {
  it("accepts valid contact data", () => {
    const result = contactFormSchema.parse({
      name: "Jane Doe",
      email: "jane@example.com",
      company: "Acme Inc.",
      message: "I would love to learn more about your platform.",
    });

    expect(result).toStrictEqual({
      name: "Jane Doe",
      email: "jane@example.com",
      company: "Acme Inc.",
      message: "I would love to learn more about your platform.",
    });
  });

  it("rejects a short message", () => {
    const result = contactFormSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      company: "Acme Inc.",
      message: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.message).toContain(
        "Please provide more details about your needs (at least 10 characters)."
      );
    }
  });
});
