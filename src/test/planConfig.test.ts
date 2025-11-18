import { describe, expect, it } from "vitest";
import {
  FREE_PLAN,
  createSubscriptionPayload,
  getPaidPlanByPriceId,
  getPaidPlanByProductId,
  getPaidPlanBySlug,
  roundToTwoDecimals,
} from "../../supabase/functions/_shared/planConfig.ts";

describe("planConfig helpers", () => {
  it("returns paid plan configuration by slug", () => {
    const plan = getPaidPlanBySlug("starter");
    expect(plan).not.toBeNull();
    expect(plan?.botsLimit).toBe(3);
    expect(plan?.conversationsLimit).toBe(750);
    expect(plan?.stripePriceId).toBe("price_1SRAf8EgFdyBUl5uXyxhzFuc");
  });

  it("returns null for unknown plan slug", () => {
    expect(getPaidPlanBySlug("unknown")).toBeNull();
  });

  it("maps Stripe price and product IDs to plans", () => {
    const fromPrice = getPaidPlanByPriceId("price_1SRAfGEgFdyBUl5uT9uiuSSH");
    const fromProduct = getPaidPlanByProductId("prod_TNwYDv1DDDmiMf");

    expect(fromPrice?.slug).toBe("executive");
    expect(fromProduct?.slug).toBe("enterprise");
  });

  it("creates subscription payload with sensible defaults", () => {
    const payload = createSubscriptionPayload(FREE_PLAN);
    expect(payload.plan).toBe("free");
    expect(payload.status).toBe("pending");
    expect(payload.price).toBe(0);
    expect(payload.bots_limit).toBe(1);
    expect(payload.conversations_limit).toBe(60);
    expect(payload.started_at).toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it("rounds numbers to two decimals", () => {
    expect(roundToTwoDecimals(29)).toBe(29);
    expect(roundToTwoDecimals(29.999)).toBeCloseTo(30);
    expect(roundToTwoDecimals(19.1234)).toBeCloseTo(19.12);
  });
});
