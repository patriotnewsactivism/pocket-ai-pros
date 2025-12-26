import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockMutateAsync = vi.fn();
const mockToast = vi.fn();

const scraperState = {
  data: null as null | {
    pages: Array<{
      url: string;
      title: string;
      text: string;
      textLength: number;
      linksFound: number;
    }>;
    errors: Array<{ url: string; message: string }>;
    summary: { pagesScraped: number; totalChars: number; durationMs: number; truncated: boolean };
  },
  errors: [] as Array<{ url: string; message: string }>,
  isPending: false,
  mutateAsync: mockMutateAsync,
};

vi.mock("@/hooks/useApi", () => ({
  useWebsiteScraper: () => scraperState,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

import WebsiteScraper from "../WebsiteScraper";

describe("WebsiteScraper", () => {
  it("submits a scrape request", async () => {
    mockMutateAsync.mockResolvedValueOnce({
      pages: [],
      errors: [],
      summary: { pagesScraped: 0, totalChars: 0, durationMs: 0, truncated: false },
    });

    const user = userEvent.setup();
    render(<WebsiteScraper />);

    await user.type(screen.getByLabelText(/target url/i), "https://example.com");
    await user.clear(screen.getByLabelText(/max pages/i));
    await user.type(screen.getByLabelText(/max pages/i), "2");
    await user.click(screen.getByRole("button", { name: /run scraper/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ url: "https://example.com", maxPages: 2 })
    );
  });

  it("renders scraped pages when data is available", () => {
    scraperState.data = {
      pages: [
        {
          url: "https://example.com",
          title: "Example Domain",
          text: "Example Domain text",
          textLength: 20,
          linksFound: 3,
        },
      ],
      errors: [],
      summary: { pagesScraped: 1, totalChars: 20, durationMs: 500, truncated: false },
    };

    render(<WebsiteScraper />);

    expect(screen.getByText("Example Domain")).toBeInTheDocument();
    expect(screen.getByText(/example.com/i)).toBeInTheDocument();

    scraperState.data = null;
  });
});
