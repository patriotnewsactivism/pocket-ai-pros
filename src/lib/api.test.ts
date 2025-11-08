import { describe, it, expect, beforeEach, vi } from 'vitest';
import api, { ApiError } from './api';

const { mockDb, invokeMock } = vi.hoisted(() => {
  const createMock = () => vi.fn();
  return {
    mockDb: {
      createContact: createMock(),
      checkSubscriber: createMock(),
      createSubscriber: createMock(),
      checkUserExists: createMock(),
      createUser: createMock(),
      getStats: createMock(),
    },
    invokeMock: vi.fn(),
  } as const;
});

vi.mock('./supabase', () => ({
  __esModule: true,
  db: mockDb,
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));

describe('api client', () => {
  beforeEach(() => {
    Object.values(mockDb).forEach((fn) => fn.mockReset());
    invokeMock.mockReset();
  });

  it('submits contact form data successfully', async () => {
    mockDb.createContact.mockResolvedValue({ id: 1 });

    const result = await api.submitContact({
      name: 'Jane Doe',
      email: 'jane@example.com',
      company: 'Acme',
      message: 'Hello',
    });

    expect(mockDb.createContact).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      company: 'Acme',
      message: 'Hello',
    });
    expect(result).toEqual({
      success: true,
      message: "Thank you for contacting us! We'll get back to you within 24 hours.",
    });
  });

  it('wraps contact submission errors in ApiError', async () => {
    mockDb.createContact.mockRejectedValue(new Error('db failure'));

    await expect(
      api.submitContact({
        name: 'Jane Doe',
        email: 'jane@example.com',
        company: 'Acme',
        message: 'Hello',
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('subscribes new email addresses', async () => {
    mockDb.checkSubscriber.mockResolvedValue(false);
    mockDb.createSubscriber.mockResolvedValue({ id: 1 });

    const result = await api.subscribe('test@example.com');

    expect(mockDb.checkSubscriber).toHaveBeenCalledWith('test@example.com');
    expect(mockDb.createSubscriber).toHaveBeenCalledWith('test@example.com');
    expect(result.success).toBe(true);
  });

  it('rejects duplicate subscriptions with ApiError', async () => {
    mockDb.checkSubscriber.mockResolvedValue(true);

    await expect(api.subscribe('dupe@example.com')).rejects.toMatchObject({
      message: 'This email is already subscribed',
      status: 400,
    });
  });

  it('wraps subscription errors in ApiError', async () => {
    mockDb.checkSubscriber.mockResolvedValue(false);
    mockDb.createSubscriber.mockRejectedValue(new Error('unexpected'));

    await expect(api.subscribe('fail@example.com')).rejects.toMatchObject({
      message: 'unexpected',
      status: 500,
    });
  });

  it('invokes edge function for reseller applications', async () => {
    invokeMock.mockResolvedValue({ data: { message: 'Received' }, error: null });

    const result = await api.applyReseller({
      name: 'Jane',
      email: 'jane@example.com',
      company: 'Acme',
      phone: '123',
      experience: 'Lots',
      expectedClients: 5,
    });

    expect(invokeMock).toHaveBeenCalledWith('process-reseller-application', {
      body: {
        name: 'Jane',
        email: 'jane@example.com',
        company: 'Acme',
        phone: '123',
        experience: 'Lots',
        expectedClients: 5,
      },
    });
    expect(result).toEqual({
      success: true,
      message: 'Received',
    });
  });

  it('wraps edge function errors for reseller applications', async () => {
    invokeMock.mockResolvedValue({ data: null, error: new Error('edge fail') });

    await expect(
      api.applyReseller({
        name: 'Jane',
        email: 'jane@example.com',
        company: 'Acme',
        phone: '123',
        experience: 'Lots',
        expectedClients: 5,
      }),
    ).rejects.toMatchObject({
      message: 'edge fail',
      status: 500,
    });
  });

  it('creates users when email is available', async () => {
    mockDb.checkUserExists.mockResolvedValue(false);
    mockDb.createUser.mockResolvedValue({ id: 'user-1' });

    const result = await api.signUp({
      name: 'Jane',
      email: 'jane@example.com',
      company: 'Acme',
      plan: 'starter',
    });

    expect(mockDb.checkUserExists).toHaveBeenCalledWith('jane@example.com');
    expect(mockDb.createUser).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@example.com',
      company: 'Acme',
      plan: 'starter',
    });
    expect(result).toEqual({
      success: true,
      message: 'Account created successfully! Check your email for next steps.',
      userId: 'user-1',
    });
  });

  it('prevents duplicate sign ups', async () => {
    mockDb.checkUserExists.mockResolvedValue(true);

    await expect(
      api.signUp({ name: 'Jane', email: 'jane@example.com', company: 'Acme', plan: 'starter' }),
    ).rejects.toMatchObject({
      message: 'An account with this email already exists',
      status: 400,
    });
  });

  it('wraps sign up errors in ApiError', async () => {
    mockDb.checkUserExists.mockResolvedValue(false);
    mockDb.createUser.mockRejectedValue(new Error('sign up failed'));

    await expect(
      api.signUp({ name: 'Jane', email: 'jane@example.com', company: 'Acme', plan: 'starter' }),
    ).rejects.toMatchObject({
      message: 'sign up failed',
      status: 500,
    });
  });

  it('returns stats from database', async () => {
    const stats = {
      totalBots: 1,
      activeUsers: 2,
      messagesProcessed: 3,
      uptime: 99.9,
    };
    mockDb.getStats.mockResolvedValue(stats);

    await expect(api.getStats()).resolves.toEqual(stats);
  });

  it('returns defaults when stats retrieval fails', async () => {
    mockDb.getStats.mockRejectedValue(new Error('stats failed'));

    await expect(api.getStats()).resolves.toEqual({
      totalBots: 500,
      activeUsers: 250,
      messagesProcessed: 150000,
      uptime: 99.9,
    });
  });
});
