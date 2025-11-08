import { beforeEach, describe, expect, it, vi } from 'vitest';

import api, { ApiError } from '@/lib/api';

const supabaseModuleMock = vi.hoisted(() => ({
  createContactMock: vi.fn(),
  checkSubscriberMock: vi.fn(),
  createSubscriberMock: vi.fn(),
  checkUserExistsMock: vi.fn(),
  createUserMock: vi.fn(),
  getStatsMock: vi.fn(),
  supabaseInvokeMock: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  db: {
    createContact: supabaseModuleMock.createContactMock,
    checkSubscriber: supabaseModuleMock.checkSubscriberMock,
    createSubscriber: supabaseModuleMock.createSubscriberMock,
    checkUserExists: supabaseModuleMock.checkUserExistsMock,
    createUser: supabaseModuleMock.createUserMock,
    getStats: supabaseModuleMock.getStatsMock,
  },
  supabase: {
    functions: {
      invoke: supabaseModuleMock.supabaseInvokeMock,
    },
  },
}));

const {
  createContactMock,
  checkSubscriberMock,
  createSubscriberMock,
  checkUserExistsMock,
  createUserMock,
  getStatsMock,
  supabaseInvokeMock,
} = supabaseModuleMock;

describe('api client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits contact form successfully', async () => {
    createContactMock.mockResolvedValueOnce({ id: 1 });

    const payload = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      company: 'Acme',
      message: 'Hello!',
    };

    const result = await api.submitContact(payload);

    expect(createContactMock).toHaveBeenCalledWith(payload);
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/Thank you for contacting us/i);
  });

  it('throws ApiError when contact submission fails', async () => {
    createContactMock.mockRejectedValueOnce(new Error('insert failed'));

    await expect(
      api.submitContact({
        name: 'Jane Doe',
        email: 'jane@example.com',
        company: 'Acme',
        message: 'Hi',
      })
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('prevents duplicate newsletter subscriptions', async () => {
    checkSubscriberMock.mockResolvedValueOnce(true);

    await expect(api.subscribe('taken@example.com')).rejects.toMatchObject({
      message: 'This email is already subscribed',
      status: 400,
    });
  });

  it('subscribes new emails to the newsletter', async () => {
    checkSubscriberMock.mockResolvedValueOnce(false);
    createSubscriberMock.mockResolvedValueOnce({ id: 42 });

    const response = await api.subscribe('fresh@example.com');

    expect(createSubscriberMock).toHaveBeenCalledWith('fresh@example.com');
    expect(response.success).toBe(true);
  });

  it('invokes reseller edge function with form payload', async () => {
    supabaseInvokeMock.mockResolvedValueOnce({
      data: { message: 'Processed' },
      error: null,
    });

    const payload = {
      name: 'Sally',
      email: 'sally@example.com',
      company: 'Growth Co',
      phone: '123',
      experience: 'Lots',
      expectedClients: 5,
    };

    const response = await api.applyReseller(payload);

    expect(supabaseInvokeMock).toHaveBeenCalledWith('process-reseller-application', {
      body: payload,
    });
    expect(response.message).toContain('Processed');
  });

  it('wraps edge function errors in ApiError', async () => {
    supabaseInvokeMock.mockResolvedValueOnce({
      data: null,
      error: new Error('Function failed'),
    });

    await expect(
      api.applyReseller({
        name: 'Sally',
        email: 'sally@example.com',
        company: 'Growth Co',
        phone: '123',
        experience: 'Lots',
        expectedClients: 5,
      })
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('prevents duplicate sign ups', async () => {
    checkUserExistsMock.mockResolvedValueOnce(true);

    await expect(
      api.signUp({ name: 'Jane', email: 'jane@example.com', company: 'Acme', plan: 'pro' })
    ).rejects.toMatchObject({
      message: 'An account with this email already exists',
      status: 400,
    });
  });

  it('creates new users when email is free', async () => {
    checkUserExistsMock.mockResolvedValueOnce(false);
    createUserMock.mockResolvedValueOnce({ id: 'user-123' });

    const result = await api.signUp({ name: 'Jane', email: 'jane@example.com', company: 'Acme', plan: 'pro' });

    expect(createUserMock).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.userId).toBe('user-123');
  });

  it('returns database stats by default', async () => {
    const stats = {
      totalBots: 10,
      activeUsers: 5,
      messagesProcessed: 1000,
      uptime: 99.9,
    };
    getStatsMock.mockResolvedValueOnce(stats);

    await expect(api.getStats()).resolves.toEqual(stats);
  });

  it('falls back to defaults when stats retrieval fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getStatsMock.mockRejectedValueOnce(new Error('network error'));

    const fallback = await api.getStats();

    expect(fallback).toEqual({
      totalBots: 500,
      activeUsers: 250,
      messagesProcessed: 150000,
      uptime: 99.9,
    });

    consoleSpy.mockRestore();
  });
});
