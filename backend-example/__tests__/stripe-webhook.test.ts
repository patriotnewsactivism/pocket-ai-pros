import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.STRIPE_SECRET_KEY = 'sk_test_mocked';

const mockStripeClient = {
  subscriptions: {
    retrieve: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

const mockStripeFactory = vi.fn(() => mockStripeClient);

vi.mock('stripe', () => ({
  __esModule: true,
  default: mockStripeFactory,
}));

const { handlers } = require('../stripe-webhook.js');

const createMockClient = (impl: (text: string, params?: unknown[]) => Promise<any>) => {
  return {
    query: vi.fn(async (text: string, params?: unknown[]) => impl(text, params)),
    release: vi.fn(),
  };
};

const createPool = (client: { query: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn> }) => ({
  connect: vi.fn(async () => client),
});

const createEmailService = () => ({
  sendWelcome: vi.fn(async () => undefined),
  sendPaymentSuccess: vi.fn(async () => undefined),
  sendPaymentFailed: vi.fn(async () => undefined),
  sendSubscriptionCancelled: vi.fn(async () => undefined),
});

const normalizeQuery = (text: string) => text.replace(/\s+/g, ' ').trim();

describe('stripe webhook handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates user and subscription on checkout completion', async () => {
    mockStripeClient.subscriptions.retrieve.mockResolvedValue({
      current_period_start: 1700000000,
      current_period_end: 1700604800,
      status: 'active',
      items: {
        data: [
          {
            price: {
              lookup_key: 'starter',
              nickname: 'Starter',
            },
          },
        ],
      },
      customer_email: 'new-user@example.com',
      customer_details: { email: 'new-user@example.com', name: 'New User' },
    });

    const emailService = createEmailService();

    const mockClient = createMockClient(async (text, params = []) => {
      const normalized = normalizeQuery(text as string);
      if (normalized === 'BEGIN' || normalized === 'COMMIT') {
        return { rows: [], rowCount: 0 };
      }
      if (normalized.startsWith('SELECT id, email, name FROM users WHERE stripe_customer_id')) {
        return { rows: [], rowCount: 0 };
      }
      if (normalized.startsWith('SELECT id, email, name FROM users WHERE email')) {
        return { rows: [], rowCount: 0 };
      }
      if (normalized.startsWith('INSERT INTO users')) {
        return {
          rows: [
            {
              id: 42,
              email: params[1],
              name: params[0],
            },
          ],
          rowCount: 1,
        };
      }
      if (normalized.startsWith('INSERT INTO subscriptions')) {
        return { rows: [], rowCount: 1 };
      }
      if (normalized === 'ROLLBACK') {
        return { rows: [], rowCount: 0 };
      }
      throw new Error(`Unexpected query: ${normalized}`);
    });

    const pool = createPool(mockClient);

    await handlers.handleCheckoutCompleted(
      {
        customer: 'cus_123',
        subscription: 'sub_123',
        customer_email: 'new-user@example.com',
        metadata: { planId: 'starter', planName: 'Starter' },
        customer_details: { name: 'New User' },
      },
      {
        pool,
        emailService,
        stripeClient: mockStripeClient,
        now: () => new Date('2025-01-01T00:00:00Z'),
      },
    );

    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO subscriptions'), expect.any(Array));
    expect(emailService.sendWelcome).toHaveBeenCalledWith('new-user@example.com', 'New User', 'Starter');
  });

  it('sends cancellation email when subscription update schedules cancellation', async () => {
    const emailService = createEmailService();
    const mockClient = createMockClient(async (text) => {
      const normalized = normalizeQuery(text as string);
      if (normalized === 'BEGIN' || normalized === 'COMMIT') {
        return { rows: [], rowCount: 0 };
      }
      if (normalized.startsWith('SELECT id, email, name FROM users WHERE stripe_customer_id')) {
        return {
          rows: [{ id: 7, email: 'existing@example.com', name: 'Existing User' }],
          rowCount: 1,
        };
      }
      if (normalized.startsWith('UPDATE users')) {
        return { rows: [], rowCount: 1 };
      }
      if (normalized.startsWith('UPDATE subscriptions')) {
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`Unexpected query: ${normalized}`);
    });

    const pool = createPool(mockClient);

    await handlers.handleSubscriptionUpdated(
      {
        id: 'sub_456',
        customer: 'cus_456',
        status: 'active',
        items: {
          data: [
            {
              price: { lookup_key: 'pro', nickname: 'Pro Plan' },
            },
          ],
        },
        current_period_end: 1701209600,
        current_period_start: 1700604800,
        cancel_at_period_end: true,
      },
      {
        pool,
        emailService,
        stripeClient: mockStripeClient,
        now: () => new Date('2025-01-01T00:00:00Z'),
      },
    );

    expect(emailService.sendSubscriptionCancelled).toHaveBeenCalledWith(
      'existing@example.com',
      'Existing User',
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
    );
  });

  it('upserts subscription data on creation event', async () => {
    const emailService = createEmailService();
    const mockClient = createMockClient(async (text) => {
      const normalized = normalizeQuery(text as string);
      if (normalized === 'BEGIN' || normalized === 'COMMIT') {
        return { rows: [], rowCount: 0 };
      }
      if (normalized.startsWith('SELECT id FROM users WHERE stripe_customer_id')) {
        return {
          rows: [{ id: 21 }],
          rowCount: 1,
        };
      }
      if (normalized.startsWith('UPDATE users')) {
        return { rows: [], rowCount: 1 };
      }
      if (normalized.startsWith('INSERT INTO subscriptions')) {
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`Unexpected query: ${normalized}`);
    });

    const pool = createPool(mockClient);

    await handlers.handleSubscriptionCreated(
      {
        id: 'sub_create',
        customer: 'cus_create',
        status: 'trialing',
        items: {
          data: [
            {
              price: { lookup_key: 'starter', nickname: 'Starter' },
            },
          ],
        },
        current_period_start: 1700604800,
        current_period_end: 1701209600,
        cancel_at_period_end: false,
      },
      {
        pool,
        emailService,
        stripeClient: mockStripeClient,
        now: () => new Date('2025-01-01T00:00:00Z'),
      },
    );

    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO subscriptions'),
      expect.any(Array),
    );
    expect(emailService.sendSubscriptionCancelled).not.toHaveBeenCalled();
  });

  it('records payment success and emails receipt', async () => {
    const emailService = createEmailService();
    const mockClient = createMockClient(async (text, params = []) => {
      const normalized = normalizeQuery(text as string);
      if (normalized === 'BEGIN' || normalized === 'COMMIT') {
        return { rows: [], rowCount: 0 };
      }
      if (normalized.startsWith('SELECT id, email, name FROM users WHERE stripe_customer_id')) {
        return {
          rows: [{ id: 12, email: 'payer@example.com', name: 'Paying User' }],
          rowCount: 1,
        };
      }
      if (normalized.startsWith('INSERT INTO payments')) {
        return { rows: [], rowCount: 1 };
      }
      if (normalized.startsWith('UPDATE subscriptions')) {
        return { rows: [], rowCount: 1 };
      }
      if (normalized.startsWith('UPDATE users')) {
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`Unexpected query: ${normalized}`);
    });

    const pool = createPool(mockClient);

    await handlers.handlePaymentSucceeded(
      {
        customer: 'cus_pay',
        subscription: 'sub_pay',
        amount_paid: 4999,
        currency: 'usd',
        id: 'in_123',
        payment_intent: 'pi_123',
        hosted_invoice_url: 'https://stripe.com/invoice',
        invoice_pdf: 'https://stripe.com/invoice.pdf',
        lines: {
          data: [
            {
              plan: { nickname: 'Starter' },
              price: { nickname: 'Starter' },
              period: { start: 1700604800, end: 1701209600 },
            },
          ],
        },
      },
      {
        pool,
        emailService,
        stripeClient: mockStripeClient,
        now: () => new Date('2025-01-01T00:00:00Z'),
      },
    );

    expect(emailService.sendPaymentSuccess).toHaveBeenCalledWith(
      'payer@example.com',
      'Paying User',
      49.99,
      'Starter',
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
    );
  });

  it('marks payment failure and notifies user', async () => {
    const emailService = createEmailService();
    const mockClient = createMockClient(async (text) => {
      const normalized = normalizeQuery(text as string);
      if (normalized === 'BEGIN' || normalized === 'COMMIT') {
        return { rows: [], rowCount: 0 };
      }
      if (normalized.startsWith('SELECT id, email, name FROM users WHERE stripe_customer_id')) {
        return {
          rows: [{ id: 33, email: 'fail@example.com', name: 'Failure User' }],
          rowCount: 1,
        };
      }
      if (normalized.startsWith('INSERT INTO payments')) {
        return { rows: [], rowCount: 1 };
      }
      if (normalized.startsWith('UPDATE subscriptions')) {
        return { rows: [], rowCount: 1 };
      }
      if (normalized.startsWith('UPDATE users')) {
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`Unexpected query: ${normalized}`);
    });

    const pool = createPool(mockClient);

    await handlers.handlePaymentFailed(
      {
        customer: 'cus_fail',
        subscription: 'sub_fail',
        amount_due: 2999,
        currency: 'usd',
        id: 'in_fail',
        payment_intent: 'pi_fail',
      },
      {
        pool,
        emailService,
        stripeClient: mockStripeClient,
        now: () => new Date('2025-01-01T00:00:00Z'),
      },
    );

    expect(emailService.sendPaymentFailed).toHaveBeenCalledWith('fail@example.com', 'Failure User', 29.99);
  });

  it('handles subscription deletion and notifies user', async () => {
    const emailService = createEmailService();
    const mockClient = createMockClient(async (text) => {
      const normalized = normalizeQuery(text as string);
      if (normalized === 'BEGIN' || normalized === 'COMMIT') {
        return { rows: [], rowCount: 0 };
      }
      if (normalized.startsWith('SELECT id, email, name FROM users WHERE stripe_customer_id')) {
        return {
          rows: [{ id: 44, email: 'cancel@example.com', name: 'Cancel User' }],
          rowCount: 1,
        };
      }
      if (normalized.startsWith('UPDATE subscriptions')) {
        return { rows: [], rowCount: 1 };
      }
      if (normalized.startsWith('UPDATE users')) {
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`Unexpected query: ${normalized}`);
    });

    const pool = createPool(mockClient);

    await handlers.handleSubscriptionDeleted(
      {
        id: 'sub_cancel',
        customer: 'cus_cancel',
        ended_at: 1700604800,
      },
      {
        pool,
        emailService,
        stripeClient: mockStripeClient,
        now: () => new Date('2025-01-01T00:00:00Z'),
      },
    );

    expect(emailService.sendSubscriptionCancelled).toHaveBeenCalledWith(
      'cancel@example.com',
      'Cancel User',
      '2023-11-21',
    );
  });
});
