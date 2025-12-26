import { describe, expect, it } from "vitest";

import { websiteScraperSchema } from "../website-scraper";

describe("websiteScraperSchema", () => {
  it("accepts valid scraper settings", () => {
    const result = websiteScraperSchema.parse({
      url: "https://example.com",
      maxPages: 5,
      maxDepth: 2,
      includeSubdomains: false,
      maxChars: 60000,
    });

    expect(result).toStrictEqual({
      url: "https://example.com",
      maxPages: 5,
      maxDepth: 2,
      includeSubdomains: false,
      maxChars: 60000,
    });
  });

  it("rejects invalid values", () => {
    const result = websiteScraperSchema.safeParse({
      url: "not-a-url",
      maxPages: 0,
      maxDepth: 10,
      includeSubdomains: true,
      maxChars: 10,
    });

    expect(result.success).toBe(false);
  });
});
