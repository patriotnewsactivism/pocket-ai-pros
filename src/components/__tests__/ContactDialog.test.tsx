import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactDialog } from "../ContactDialog";

const mutateMock = vi.fn();

vi.mock("@/hooks/useApi", () => ({
  useContactForm: () => ({ mutate: mutateMock, isPending: false }),
}));

vi.mock("@/components/ui/dialog", () => {
  const Dialog = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const DialogContent = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const DialogHeader = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const DialogTitle = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const DialogDescription = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const DialogTrigger = ({ children }: { children: ReactNode }) => <>{children}</>;

  return {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
  };
});

describe("ContactDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateMock.mockImplementation((_values, options) => {
      options?.onSuccess?.();
    });
  });

  it("submits the form via the contact mutation", async () => {
    const user = userEvent.setup();
    render(<ContactDialog />);

    await user.type(screen.getByLabelText(/full name/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/email address/i), "ada@example.com");
    await user.type(screen.getByLabelText(/company name/i), "Analytical Engines");
    await user.type(screen.getByLabelText(/tell us about your needs/i), "Need a bot");
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalled();
    });

    const [values] = mutateMock.mock.calls[0];
    expect(values).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: "Analytical Engines",
      message: "Need a bot",
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue("");
    });
  });

  it("shows validation errors when required fields are missing", async () => {
    const user = userEvent.setup();
    render(<ContactDialog />);

    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(
      await screen.findByText("Full name is required")
    ).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });
});
