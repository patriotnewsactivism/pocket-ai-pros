import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResellerDialog } from "../ResellerDialog";

const mutateMock = vi.fn();

vi.mock("@/hooks/useApi", () => ({
  useResellerApplication: () => ({ mutate: mutateMock, isPending: false }),
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

describe("ResellerDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateMock.mockImplementation((_values, options) => {
      options?.onSuccess?.();
    });
  });

  it("calls the reseller mutation with normalized values", async () => {
    const user = userEvent.setup();
    render(<ResellerDialog />);

    await user.type(screen.getByLabelText(/full name/i), "Sam");
    await user.type(screen.getByLabelText(/email address/i), "sam@example.com");
    await user.type(screen.getByLabelText(/company name/i), "Sam Co");
    await user.type(screen.getByLabelText(/phone number/i), "+1 555-0000");
    await user.type(
      screen.getByLabelText(/expected number of clients/i),
      "10"
    );
    await user.type(
      screen.getByLabelText(/your experience/i),
      "Lots of SaaS experience"
    );
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalled();
    });

    const [values] = mutateMock.mock.calls[0];
    expect(values).toMatchObject({
      name: "Sam",
      email: "sam@example.com",
      company: "Sam Co",
      phone: "+1 555-0000",
      experience: "Lots of SaaS experience",
      expectedClients: 10,
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toHaveValue("");
    });
  });

  it("displays validation errors for invalid input", async () => {
    const user = userEvent.setup();
    render(<ResellerDialog />);

    await user.type(screen.getByLabelText(/full name/i), "Sam");
    await user.type(screen.getByLabelText(/email address/i), "sam@example.com");
    await user.type(screen.getByLabelText(/company name/i), "Sam Co");
    await user.type(screen.getByLabelText(/expected number of clients/i), "-5");
    await user.click(screen.getByRole("button", { name: /submit application/i }));

    expect(
      await screen.findByText("Expected clients must be a positive number")
    ).toBeInTheDocument();
    expect(mutateMock).not.toHaveBeenCalled();
  });
});
