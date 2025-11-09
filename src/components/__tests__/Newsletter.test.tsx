import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import Newsletter from "../Newsletter";
import { useNewsletterSubscription } from "@/hooks/useApi";
import { trackEvent } from "@/components/Analytics";

vi.mock("@/hooks/useApi", () => ({
  useNewsletterSubscription: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/Analytics", () => ({
  trackEvent: vi.fn(),
}));

const useNewsletterSubscriptionMock = vi.mocked(useNewsletterSubscription);
const trackEventMock = vi.mocked(trackEvent);

afterEach(() => {
  cleanup();
});

describe("Newsletter", () => {
  it("submits and shows success state", async () => {
    const mutate = vi.fn((_, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    });
    useNewsletterSubscriptionMock.mockReturnValue({ mutate, isPending: false });
    const user = userEvent.setup();

    render(<Newsletter />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe free/i }));

    expect(mutate).toHaveBeenCalledWith(
      "jane@example.com",
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(trackEventMock).toHaveBeenCalledWith("newsletterSignup");
    expect(await screen.findByText(/Thanks for subscribing!/i)).toBeInTheDocument();
  });

  it("renders validation error for invalid email", async () => {
    useNewsletterSubscriptionMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    const user = userEvent.setup();

    render(<Newsletter />);

    await user.click(screen.getByRole("button", { name: /subscribe free/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });
});
