import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactDialog } from '../ContactDialog';

const submitContactMock = vi.fn();

vi.mock('@/hooks/useApi', () => ({
  useContactForm: () => ({
    mutate: submitContactMock,
    isPending: false,
  }),
}));

describe('ContactDialog', () => {
  beforeEach(() => {
    submitContactMock.mockReset();
  });

  it('submits form data and closes on success', async () => {
    const user = userEvent.setup();
    render(<ContactDialog trigger={<button>Open dialog</button>} defaultPlan="Pro" />);

    await user.click(screen.getByRole('button', { name: /open dialog/i }));

    const nameInput = await screen.findByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');
    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/company name/i), 'Acme Inc.');
    const messageInput = screen.getByLabelText(/tell us about your needs/i);
    await user.clear(messageInput);
    await user.type(messageInput, 'Need help with onboarding.');

    await user.click(screen.getByRole('button', { name: /submit request/i }));

    expect(submitContactMock).toHaveBeenCalledWith(
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        company: 'Acme Inc.',
        message: 'Need help with onboarding.',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );

    const [, options] = submitContactMock.mock.calls[0];
    await act(async () => {
      options?.onSuccess?.({ success: true, message: 'done' });
    });

    await waitFor(() => {
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    });
  }, 10000);
});
