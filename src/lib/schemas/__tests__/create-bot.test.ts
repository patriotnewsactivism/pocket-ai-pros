import { describe, expect, it } from "vitest";

import { createBotSchema } from "../create-bot";

describe("createBotSchema", () => {
  it("requires a bot name", () => {
    const result = createBotSchema.safeParse({ name: "", description: "", templateId: "support" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toContain(
        "Please provide a name for your bot."
      );
    }
  });

  it("requires a template selection", () => {
    const result = createBotSchema.safeParse({ name: "Sales Bot", description: "", templateId: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.templateId).toContain(
        "Please choose a starting template for your bot."
      );
    }
  });

  it("accepts valid data", () => {
    const result = createBotSchema.parse({
      name: "Support Bot",
      description: "Helps answer customer questions.",
      templateId: "support",
    });

    expect(result).toStrictEqual({
      name: "Support Bot",
      description: "Helps answer customer questions.",
      templateId: "support",
    });
  });
});
