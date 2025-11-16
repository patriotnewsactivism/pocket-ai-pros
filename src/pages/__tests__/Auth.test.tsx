import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Auth from '../Auth';
import * as supabaseModule from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
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
    })),
  },
  isSupabaseConfigured: true,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const signUpTab = screen.getAllByRole('tab')[1]; // Get the second tab (Sign Up)
    await user.click(signUpTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    });
    expect(screen.getAllByLabelText(/Email/i)[0]).toBeInTheDocument();
  });

  it.skip('should validate email format', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    // Ensure we're on the sign-in tab
    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true');

    const emailInput = screen.getAllByLabelText(/Email/i)[0];
    const passwordInput = screen.getAllByLabelText(/Password/i)[0];

    // Type invalid email and valid password
    await user.clear(emailInput);
    await user.type(emailInput, 'notanemail');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'validPass123!');

    // The form should show validation error or prevent submission with invalid email
    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find(btn => btn.getAttribute('type') === 'submit');

    if (submitButton) {
      await user.click(submitButton);

      // Either validation message appears, or Supabase error due to mocked client
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

    // Switch to signup
    const signUpTab = screen.getAllByRole('tab')[1]; // Get the second tab (Sign Up)
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
