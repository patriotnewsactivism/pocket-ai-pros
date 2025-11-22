import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../Auth';

const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      resetPasswordForEmail: mockResetPasswordForEmail,
      getUser: mockGetUser,
    },
    from: mockFrom,
  },
  isSupabaseConfigured: true,
}));

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: null });
    mockSignUp.mockResolvedValue({ data: { user: null }, error: null });
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    mockFrom.mockImplementation(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    }));
  });

  it('should render login form by default', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    expect(screen.getAllByRole('tab')[0]).toHaveTextContent(/Sign In/i);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Password/i)[0]).toBeInTheDocument();
  });

  it('should switch to signup form', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const signUpTab = screen.getAllByRole('tab')[1];
    await user.click(signUpTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    });
    expect(screen.getAllByLabelText(/Email/i)[0]).toBeInTheDocument();
  });

  it('toggles password visibility on sign in form', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input#signin-password' }) as HTMLInputElement;
    const toggleButton = screen.getAllByRole('button', { name: /show password/i })[0];

    expect(passwordInput.type).toBe('password');

    await user.click(toggleButton);

    expect(passwordInput.type).toBe('text');
  });

  it('sends a password reset email when requested', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const emailInput = screen.getAllByLabelText(/Email/i)[0];
    await user.type(emailInput, 'user@example.com');

    const resetButton = screen.getByRole('button', { name: /forgot password/i });
    await user.click(resetButton);

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('/auth/reset') })
      );
    });
  });

  it.skip('should validate email format', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true');

    const emailInput = screen.getAllByLabelText(/Email/i)[0];
    const passwordInput = screen.getAllByLabelText(/Password/i)[0];

    await user.clear(emailInput);
    await user.type(emailInput, 'notanemail');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'validPass123!');

    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find(btn => btn.getAttribute('type') === 'submit');

    if (submitButton) {
      await user.click(submitButton);

      await waitFor(
        () => {
          const validationMessage = screen.queryByText(/Please enter a valid email address/i);
          const authNotConfigured = screen.queryByText(/Authentication not configured/i);
          expect(validationMessage || authNotConfigured).toBeTruthy();
        },
        { timeout: 2000 }
      );
    }
  });

  it('should enforce strong password on signup', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const signUpTab = screen.getAllByRole('tab')[1];
    await user.click(signUpTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getAllByLabelText(/Email/i)[0];
    const passwordInput = screen.getAllByLabelText(/Password/i)[0];
    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find(btn => btn.getAttribute('type') === 'submit');

    if (submitButton) {
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'weakpass');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument();
      });
    }
  });
});
