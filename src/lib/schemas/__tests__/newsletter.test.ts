import { describe, expect, it } from "vitest";

import { newsletterSubscriptionSchema } from "../newsletter";

describe("newsletterSubscriptionSchema", () => {
  it("accepts a valid email", () => {
    expect(() =>
      newsletterSubscriptionSchema.parse({ email: "valid@example.com" })
    ).not.toThrow();
  });

  it("rejects an invalid email", () => {
    const result = newsletterSubscriptionSchema.safeParse({ email: "invalid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain(
        "Please enter a valid email address."
      );
    }
  });
});
