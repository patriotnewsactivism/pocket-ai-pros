import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorFallback } from "@/components/ErrorFallback";

describe("ErrorFallback", () => {
  it("displays the provided error message", () => {
    render(<ErrorFallback error={new Error("Boom")} />);
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  it("calls resetErrorBoundary when retry is clicked", async () => {
    const resetErrorBoundary = vi.fn();
    render(<ErrorFallback error={new Error("Boom")} resetErrorBoundary={resetErrorBoundary} />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    const user = userEvent.setup();
    await user.click(retryButton);

    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });
});
