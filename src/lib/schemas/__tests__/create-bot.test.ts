import { describe, expect, it } from "vitest";

import { createBotSchema } from "../create-bot";

describe("createBotSchema", () => {
  it("requires a bot name", () => {
    const result = createBotSchema.safeParse({ name: "", description: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        "Please provide a name for your bot."
      );
    }
  });

  it("accepts valid data", () => {
    const result = createBotSchema.parse({
      name: "Support Bot",
      description: "Helps answer customer questions.",
    });

    expect(result).toStrictEqual({
      name: "Support Bot",
      description: "Helps answer customer questions.",
    });
  });
});
