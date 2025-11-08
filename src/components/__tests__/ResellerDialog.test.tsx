import { describe, it, beforeEach, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResellerDialog } from '../ResellerDialog';

const applyResellerMock = vi.fn();

vi.mock('@/hooks/useApi', () => ({
  useResellerApplication: () => ({
    mutate: applyResellerMock,
    isPending: false,
  }),
}));

describe('ResellerDialog', () => {
  beforeEach(() => {
    applyResellerMock.mockReset();
  });

  it('submits reseller application with normalized data', async () => {
    const user = userEvent.setup();
    render(<ResellerDialog trigger={<button>Open reseller</button>} />);

    await user.click(screen.getByRole('button', { name: /open reseller/i }));

    await user.type(await screen.findByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/company name/i), 'Acme Co');
    await user.type(screen.getByLabelText(/phone number/i), '+15551234567');
    await user.type(screen.getByLabelText(/expected number of clients/i), '12');
    await user.type(
      screen.getByLabelText(/your experience & why you'd be a great partner/i),
      'Years of SaaS sales experience.',
    );

    await user.click(screen.getByRole('button', { name: /submit application/i }));

    expect(applyResellerMock).toHaveBeenCalledWith(
      {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Co',
        phone: '+15551234567',
        experience: 'Years of SaaS sales experience.',
        expectedClients: 12,
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );

    const [, options] = applyResellerMock.mock.calls[0];
    await act(async () => {
      options?.onSuccess?.({ success: true, message: 'submitted' });
    });

    await waitFor(() => {
      expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument();
    });
  }, 10000);
});
