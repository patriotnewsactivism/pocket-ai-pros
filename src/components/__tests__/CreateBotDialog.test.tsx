import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CreateBotDialog from "../CreateBotDialog";

const hoisted = vi.hoisted(() => {
  const toastMock = vi.fn();
  const getUserMock = vi.fn();
  const insertMock = vi.fn();
  const fromMock = vi.fn(() => ({ insert: insertMock }));
  return { toastMock, getUserMock, insertMock, fromMock };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: hoisted.toastMock }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: hoisted.getUserMock },
    from: hoisted.fromMock,
  },
}));

vi.mock("@/components/ui/dialog", () => {
  const Dialog = ({ children, open }: { children: ReactNode; open?: boolean }) => (
    <div data-testid="dialog" data-open={open}>
      {open ? children : null}
    </div>
  );
  const DialogContent = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const DialogHeader = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const DialogTitle = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const DialogDescription = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
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

describe("CreateBotDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.fromMock.mockImplementation(() => ({ insert: hoisted.insertMock }));
    hoisted.getUserMock.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
    hoisted.insertMock.mockResolvedValue({ error: null });
  });

  it("submits valid data and creates a bot", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onBotCreated = vi.fn();

    render(
      <CreateBotDialog
        open
        onOpenChange={onOpenChange}
        onBotCreated={onBotCreated}
      />
    );

    await user.type(screen.getByLabelText(/bot name/i), "  Support Bot  ");
    await user.type(screen.getByLabelText(/description/i), "  Helps customers  ");
    await user.click(screen.getByRole("button", { name: /create bot/i }));

    await waitFor(() => {
      expect(hoisted.insertMock).toHaveBeenCalled();
    });

    expect(hoisted.fromMock).toHaveBeenCalledWith("bots");
    expect(hoisted.insertMock).toHaveBeenCalledWith({
      user_id: "user-123",
      name: "Support Bot",
      description: "Helps customers",
      status: "active",
      conversations_count: 0,
      configuration: {},
    });
    expect(onBotCreated).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows validation errors when required fields are missing", async () => {
    const user = userEvent.setup();

    render(
      <CreateBotDialog open onOpenChange={vi.fn()} onBotCreated={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: /create bot/i }));

    expect(
      await screen.findByText("Bot name is required")
    ).toBeInTheDocument();
    expect(hoisted.insertMock).not.toHaveBeenCalled();
    expect(hoisted.toastMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: "Success!" })
    );
  });

  it("surfaces errors from Supabase", async () => {
    const user = userEvent.setup();
    const error = new Error("Failed to insert");
    hoisted.insertMock.mockResolvedValueOnce({ error });

    render(
      <CreateBotDialog open onOpenChange={vi.fn()} onBotCreated={vi.fn()} />
    );

    await user.type(screen.getByLabelText(/bot name/i), "Support Bot");
    await user.click(screen.getByRole("button", { name: /create bot/i }));

    await waitFor(() => {
      expect(hoisted.toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "Failed to insert",
        })
      );
    });
  });
});
