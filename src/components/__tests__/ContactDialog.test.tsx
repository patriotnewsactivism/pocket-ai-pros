import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ContactForm } from "../ContactDialog";
import * as apiHooks from "@/hooks/useApi";

const mutateMock = vi.fn();
const toastMock = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

type MutateOptions = Parameters<ReturnType<typeof apiHooks.useContactForm>["mutate"]>[1];

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.spyOn(apiHooks, "useContactForm").mockReturnValue({ mutate: mutateMock, isPending: false });
  });

  it("announces pending state and shows success confirmation before closing", async () => {
    vi.useFakeTimers();
    let receivedOptions: MutateOptions | undefined;
    mutateMock.mockImplementation((_payload, options) => {
      receivedOptions = options;
    });

    const onSubmitted = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.runAllTimers });

    render(<ContactForm defaultMessage="Hello" onSubmitted={onSubmitted} />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
    await user.type(screen.getByLabelText(/tell us about your needs/i), "Test message");
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(
      screen.getByText(/submitting your request/i, { selector: "p" })
    ).toBeInTheDocument();

    receivedOptions?.onSuccess?.({ message: "We got your request" }, {} as never, undefined);

    expect(toastMock).toHaveBeenCalledWith({
      title: "Request received",
      description: "We got your request",
    });
    expect(screen.getByText("We got your request")).toBeInTheDocument();
    expect(onSubmitted).not.toHaveBeenCalled();

    vi.runAllTimers();
    await waitFor(() => expect(onSubmitted).toHaveBeenCalledTimes(1));
  });

  it("shows inline errors and keeps dialog open on failure", async () => {
    let receivedOptions: MutateOptions | undefined;
    mutateMock.mockImplementation((_payload, options) => {
      receivedOptions = options;
    });

    const onSubmitted = vi.fn();
    const user = userEvent.setup();

    render(<ContactForm defaultMessage="Hello" onSubmitted={onSubmitted} />);

    await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
    await user.type(screen.getByLabelText(/tell us about your needs/i), "Test message");
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    receivedOptions?.onError?.({ message: "Server unavailable" }, {} as never, undefined);

    expect(toastMock).toHaveBeenCalledWith({
      title: "Submission failed",
      description: "Server unavailable",
      variant: "destructive",
    });
    expect(screen.getByText("Server unavailable")).toBeInTheDocument();
    expect(onSubmitted).not.toHaveBeenCalled();
  });
});
