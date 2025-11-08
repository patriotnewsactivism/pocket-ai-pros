import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactDialog } from '@/components/ContactDialog';
import { ResellerDialog } from '@/components/ResellerDialog';
import Newsletter from '@/components/Newsletter';

const formMocks = vi.hoisted(() => ({
  contactMutate: vi.fn(),
  resellerMutate: vi.fn(),
  toastMock: vi.fn(),
  createSubscriberMock: vi.fn(),
  trackEventMock: vi.fn(),
}));

vi.mock('@/hooks/useApi', () => ({
  useContactForm: () => ({ mutate: formMocks.contactMutate, isPending: false }),
  useResellerApplication: () => ({ mutate: formMocks.resellerMutate, isPending: false }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: formMocks.toastMock }),
}));

vi.mock('@/lib/supabase', () => ({
  db: {
    createSubscriber: formMocks.createSubscriberMock,
  },
}));

vi.mock('@/components/Analytics', () => ({
  trackEvent: formMocks.trackEventMock,
}));

const { contactMutate, resellerMutate, toastMock, createSubscriberMock, trackEventMock } = formMocks;

describe('Lead capture forms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the contact form with user data', async () => {
    render(<ContactDialog />);

    fireEvent.click(screen.getByRole('button', { name: /get started free/i }));

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Acme Inc.' } });
    fireEvent.change(screen.getByLabelText(/tell us about your needs/i), { target: { value: 'Need a bot' } });

    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => expect(contactMutate).toHaveBeenCalled());

    const [payload, options] = contactMutate.mock.calls[0];
    expect(payload).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
      company: 'Acme Inc.',
      message: 'Need a bot',
    });

    await act(async () => {
      await options?.onSuccess?.({ success: true });
    });

    await waitFor(() => {
      expect(screen.queryByText(/submit request/i)).not.toBeInTheDocument();
    });
  });

  it('converts reseller expected clients to a number', async () => {
    render(<ResellerDialog />);

    fireEvent.click(screen.getByRole('button', { name: /apply for reseller program/i }));

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Sam Seller' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'sam@example.com' } });
    fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: 'Salesforce' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+1 555 0000' } });
    fireEvent.change(screen.getByLabelText(/expected number of clients/i), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText(/experience/i), { target: { value: 'Years of experience' } });

    fireEvent.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => expect(resellerMutate).toHaveBeenCalled());

    const [payload, options] = resellerMutate.mock.calls[0];
    expect(payload).toEqual({
      name: 'Sam Seller',
      email: 'sam@example.com',
      company: 'Salesforce',
      phone: '+1 555 0000',
      experience: 'Years of experience',
      expectedClients: 25,
    });

    await act(async () => {
      await options?.onSuccess?.({ success: true });
    });

    await waitFor(() => {
      expect(screen.queryByText(/submit application/i)).not.toBeInTheDocument();
    });
  });

  it('subscribes to the newsletter with a valid email', async () => {
    createSubscriberMock.mockResolvedValueOnce({ id: 1 });

    render(<Newsletter />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /subscribe free/i }));

    await waitFor(() => expect(createSubscriberMock).toHaveBeenCalledWith('user@example.com'));
    expect(trackEventMock).toHaveBeenCalledWith('newsletterSignup');
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Successfully subscribed!',
      })
    );
  });

  it('guards against invalid newsletter addresses', async () => {
    render(<Newsletter />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid' } });

    const form = emailInput.closest('form');
    expect(form).not.toBeNull();

    Object.defineProperty(emailInput, 'validity', {
      value: { valid: true },
      configurable: true,
    });

    fireEvent.submit(form!);

    expect(createSubscriberMock).not.toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Invalid email',
        variant: 'destructive',
      })
    );
  });

  it('shows an error toast when the newsletter subscription fails', async () => {
    createSubscriberMock.mockRejectedValueOnce(new Error('Network down'));

    render(<Newsletter />);

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /subscribe free/i }));

    await waitFor(() => expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Subscription failed',
        variant: 'destructive',
      })
    ));
  });
});
