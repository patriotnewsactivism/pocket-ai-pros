import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Newsletter from "../Newsletter";

const hoisted = vi.hoisted(() => {
  const mutateMock = vi.fn();
  const trackEventMock = vi.fn();
  return { mutateMock, trackEventMock };
});

vi.mock("@/hooks/useApi", () => ({
  useNewsletterSubscription: () => ({
    mutate: hoisted.mutateMock,
    isPending: false,
  }),
}));

vi.mock("../Analytics", () => ({
  trackEvent: hoisted.trackEventMock,
}));

describe("Newsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.mutateMock.mockImplementation((_email, options) => {
      options?.onSuccess?.();
    });
  });

  it("subscribes successfully", async () => {
    const user = userEvent.setup();
    render(<Newsletter />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    await user.type(emailInput, "user@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe free/i }));

    await waitFor(() => {
      expect(hoisted.mutateMock).toHaveBeenCalledWith(
        "user@example.com",
        expect.any(Object)
      );
    });

    expect(hoisted.trackEventMock).toHaveBeenCalledWith("newsletterSignup");
    expect(
      await screen.findByText(/thanks for subscribing/i)
    ).toBeInTheDocument();
  });

  it("shows validation feedback for invalid emails", async () => {
    const user = userEvent.setup();
    render(<Newsletter />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    await user.type(emailInput, "invalid-email");
    await user.click(screen.getByRole("button", { name: /subscribe free/i }));

    expect(
      await screen.findByText("Please enter a valid email address")
    ).toBeInTheDocument();
    expect(hoisted.mutateMock).not.toHaveBeenCalled();
  });
});
