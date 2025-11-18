import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

// Mock Supabase
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
      signOut: vi.fn(),
    },
    from: mockFrom,
  },
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

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
    });
    
    mockFrom.mockImplementation((table) => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      return mockChain;
    });
  });

  it('should redirect to auth if not logged in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });

  it('should render dashboard for authenticated user', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-user-id',
              full_name: 'Test User',
              plan: 'professional',
              bots_limit: 5,
              conversations_limit: 5000,
              conversations_used: 100,
            },
            error: null,
          }),
        };
      }
      if (table === 'bots') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'bot-1',
                name: 'Test Bot',
                description: 'A test bot',
                conversations_count: 10,
                status: 'active',
              },
            ],
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    });
  });

  it('should show bot limit warning when limit reached', async () => {
    mockFrom.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-user-id',
              full_name: 'Test User',
              plan: 'starter',
              bots_limit: 3,
              conversations_limit: 750,
              conversations_used: 100,
            },
            error: null,
          }),
        };
      }
      if (table === 'bots') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              { id: 'bot-1', name: 'Bot 1', status: 'active' },
              { id: 'bot-2', name: 'Bot 2', status: 'active' },
              { id: 'bot-3', name: 'Bot 3', status: 'active' },
            ],
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/3 \/ 3/i)).toBeInTheDocument();
    });
  });
});
