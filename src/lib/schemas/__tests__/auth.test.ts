import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema } from "../auth";

describe("auth schemas", () => {
  it("signInSchema validates credentials", () => {
    const result = signInSchema.parse({
      email: "user@example.com",
      password: "password123",
    });

    expect(result).toStrictEqual({
      email: "user@example.com",
      password: "password123",
    });
  });

  it("signUpSchema requires a name", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      fullName: "",
      company: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.fullName).toContain(
        "Please enter your full name."
      );
    }
  });
});
