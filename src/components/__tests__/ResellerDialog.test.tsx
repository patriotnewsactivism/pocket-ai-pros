import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResellerApplicationForm } from "../ResellerDialog";
import { useResellerApplication } from "@/hooks/useApi";

vi.mock("@/hooks/useApi", () => ({
  useResellerApplication: vi.fn(),
}));

const useResellerApplicationMock = vi.mocked(useResellerApplication);

afterEach(() => {
  cleanup();
});

describe("ResellerApplicationForm", () => {
  beforeEach(() => {
    useResellerApplicationMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it("submits a valid reseller application", async () => {
    const mutate = vi.fn((_, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    });
    useResellerApplicationMock.mockReturnValue({ mutate, isPending: false });
    const onSubmitted = vi.fn();
    const user = userEvent.setup();

    render(<ResellerApplicationForm onSubmitted={onSubmitted} />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
    await user.type(screen.getByLabelText(/company name/i), "Acme Inc.");
    await user.type(screen.getByLabelText(/phone number/i), "+1 555 123-4567");
    await user.type(screen.getByLabelText(/expected number of clients/i), "10");
    await user.type(screen.getByLabelText(/your experience/i), "Experienced reseller.");

    await user.click(screen.getByRole("button", { name: /submit application/i }));

    expect(mutate).toHaveBeenCalledWith(
      {
        name: "Jane Doe",
        email: "jane@example.com",
        company: "Acme Inc.",
        phone: "+1 555 123-4567",
        experience: "Experienced reseller.",
        expectedClients: 10,
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onSubmitted).toHaveBeenCalled();
  });

  it("shows validation messages when input is invalid", async () => {
    const user = userEvent.setup();

    render(<ResellerApplicationForm />);

    await user.click(screen.getByRole("button", { name: /submit application/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter your full name/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/Please enter your company name/i)).toBeInTheDocument();
  });
});
