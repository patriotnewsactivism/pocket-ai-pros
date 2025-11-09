import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "../ContactDialog";
import { useContactForm } from "@/hooks/useApi";

vi.mock("@/hooks/useApi", () => ({
  useContactForm: vi.fn(),
}));

const useContactFormMock = vi.mocked(useContactForm);

afterEach(() => {
  cleanup();
});

describe("ContactForm", () => {
  beforeEach(() => {
    useContactFormMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("submits valid data", async () => {
    const mutate = vi.fn((_, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    });
    useContactFormMock.mockReturnValue({ mutate, isPending: false });
    const onSubmitted = vi.fn();
    const user = userEvent.setup();

    render(<ContactForm defaultMessage="" onSubmitted={onSubmitted} />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
    await user.type(screen.getByLabelText(/tell us about your needs/i), "I need a chatbot for support.");

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(mutate).toHaveBeenCalledWith(
      {
        name: "Jane Doe",
        email: "jane@example.com",
        company: undefined,
        message: "I need a chatbot for support.",
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onSubmitted).toHaveBeenCalled();
  });

  it("shows validation errors for invalid input", async () => {
    const user = userEvent.setup();

    render(<ContactForm defaultMessage="" />);

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter your full name/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Please provide more details about your needs/)).toBeInTheDocument();
  });
});
