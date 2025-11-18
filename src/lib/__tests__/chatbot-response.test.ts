import { describe, expect, it } from "vitest";

import { createHumanizedResponse } from "../chatbot";

describe("createHumanizedResponse", () => {
  it("wraps responses with conversational context", () => {
    const response = createHumanizedResponse({
      baseAnswer: "We ship worldwide within 5 days",
      userMessage: "Can you ship to Canada?",
      businessName: "Logistics Bot",
      capabilities: ["Shipping information", "Order tracking", "Customs help"],
    });

    expect(response).toMatch(/Thanks for sharing those details/i);
    expect(response).toMatch(/We ship worldwide within 5 days\./i);
    expect(response).toMatch(/Shipping information, Order tracking, and Customs help/i);
  });

  it("falls back gracefully without user details", () => {
    const response = createHumanizedResponse({
      baseAnswer: "",
      userMessage: "",
      businessName: "Support Assistant",
      capabilities: [],
    });

    expect(response).toMatch(/Support Assistant/);
    expect(response).toMatch(/Let me double-check that for you/i);
    expect(response).toMatch(/Let me know if there's anything else you need/i);
  });
});
