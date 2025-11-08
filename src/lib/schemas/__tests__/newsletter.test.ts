import { describe, expect, it } from "vitest";

import { newsletterSubscriptionSchema } from "../newsletter";

describe("newsletterSubscriptionSchema", () => {
  it("accepts a valid email", () => {
    const result = newsletterSubscriptionSchema.safeParse({
      email: "user@example.com",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects invalid emails", () => {
    const result = newsletterSubscriptionSchema.safeParse({
      email: "invalid-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Please enter a valid email address"
      );
    }
  });
});
