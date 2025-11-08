import { describe, expect, it } from "vitest";

import { createBotSchema } from "../create-bot";

describe("createBotSchema", () => {
  it("accepts valid values", () => {
    const result = createBotSchema.safeParse({
      name: "Support Bot",
      description: "Helps customers",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "Support Bot",
        description: "Helps customers",
      });
    }
  });

  it("requires a bot name", () => {
    const result = createBotSchema.safeParse({
      name: "",
      description: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Bot name is required");
    }
  });

  it("limits description length", () => {
    const longDescription = "a".repeat(501);
    const result = createBotSchema.safeParse({
      name: "Assistant",
      description: longDescription,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Description must be 500 characters or fewer"
      );
    }
  });
});
