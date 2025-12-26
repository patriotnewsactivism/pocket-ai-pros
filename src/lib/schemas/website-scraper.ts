import { z } from "zod";

export const websiteScraperSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Enter a valid URL including http:// or https://.")
    .max(2048, "URL is too long."),
  maxPages: z.coerce
    .number()
    .int()
    .min(1, "Minimum is 1 page.")
    .max(25, "Maximum is 25 pages."),
  maxDepth: z.coerce
    .number()
    .int()
    .min(0, "Minimum depth is 0.")
    .max(4, "Maximum depth is 4."),
  includeSubdomains: z.boolean(),
  maxChars: z.coerce
    .number()
    .int()
    .min(1000, "Minimum is 1000 characters.")
    .max(200000, "Maximum is 200000 characters."),
});

export type WebsiteScraperFormValues = z.infer<typeof websiteScraperSchema>;
