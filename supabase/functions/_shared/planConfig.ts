export type PaidPlanSlug = 'starter' | 'professional' | 'executive' | 'enterprise';
export type PlanSlug = 'free' | PaidPlanSlug;

export interface PlanConfigBase {
  slug: PlanSlug;
  priceCents: number;
  botsLimit: number;
  conversationsLimit: number;
}

export interface PaidPlanConfig extends PlanConfigBase {
  slug: PaidPlanSlug;
  stripePriceId: string;
  stripeProductId: string;
}

export interface SubscriptionUpsertPayload {
  plan: PlanSlug;
  status: string;
  price: number;
  bots_limit: number;
  conversations_limit: number;
  stripe_subscription_id?: string | null;
  started_at?: string | null;
  expires_at?: string | null;
}

export const FREE_PLAN: PlanConfigBase = {
  slug: 'free',
  priceCents: 0,
  botsLimit: 1,
  conversationsLimit: 60,
} as const;

const PLAN_DEFINITIONS: Record<PaidPlanSlug, PaidPlanConfig> = {
  starter: {
    slug: 'starter',
    priceCents: 2900,
    botsLimit: 3,
    conversationsLimit: 750,
    stripePriceId: 'price_1SRAf8EgFdyBUl5uXyxhzFuc',
    stripeProductId: 'prod_TNwYO6OpOO87gJ',
  },
  professional: {
    slug: 'professional',
    priceCents: 9900,
    botsLimit: 5,
    conversationsLimit: 5000,
    stripePriceId: 'price_1SRAfFEgFdyBUl5ubXElJPkQ',
    stripeProductId: 'prod_TNwYGAd8TXQ6JS',
  },
  executive: {
    slug: 'executive',
    priceCents: 19900,
    botsLimit: 10,
    conversationsLimit: 15000,
    stripePriceId: 'price_1SRAfGEgFdyBUl5uT9uiuSSH',
    stripeProductId: 'prod_TNwYeZyWmkfzaJ',
  },
  enterprise: {
    slug: 'enterprise',
    priceCents: 39900,
    botsLimit: 999,
    conversationsLimit: 50000,
    stripePriceId: 'price_1SRAfHEgFdyBUl5u2wjqK7td',
    stripeProductId: 'prod_TNwYDv1DDDmiMf',
  },
} as const;

const PRICE_ID_INDEX = new Map<string, PaidPlanConfig>();
const PRODUCT_ID_INDEX = new Map<string, PaidPlanConfig>();

for (const plan of Object.values(PLAN_DEFINITIONS)) {
  PRICE_ID_INDEX.set(plan.stripePriceId, plan);
  PRODUCT_ID_INDEX.set(plan.stripeProductId, plan);
}

export const PAID_PLANS: PaidPlanConfig[] = Object.values(PLAN_DEFINITIONS);

export function getPaidPlanBySlug(value: string | null | undefined): PaidPlanConfig | null {
  if (!value) return null;
  const key = value.toLowerCase() as PaidPlanSlug;
  return PLAN_DEFINITIONS[key] ?? null;
}

export function getPaidPlanByPriceId(priceId: string | null | undefined): PaidPlanConfig | null {
  if (!priceId) return null;
  return PRICE_ID_INDEX.get(priceId) ?? null;
}

export function getPaidPlanByProductId(productId: string | null | undefined): PaidPlanConfig | null {
  if (!productId) return null;
  return PRODUCT_ID_INDEX.get(productId) ?? null;
}

export function createSubscriptionPayload(
  plan: PlanConfigBase,
  overrides: Partial<SubscriptionUpsertPayload> = {}
): SubscriptionUpsertPayload {
  return {
    plan: plan.slug,
    status: 'pending',
    price: roundToTwoDecimals(plan.priceCents / 100),
    bots_limit: plan.botsLimit,
    conversations_limit: plan.conversationsLimit,
    stripe_subscription_id: null,
    started_at: new Date().toISOString(),
    expires_at: null,
    ...overrides,
  };
}

export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
