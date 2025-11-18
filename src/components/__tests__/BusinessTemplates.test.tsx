import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockTemplates = [
  {
    id: "test",
    name: "Test Template",
    description: "Handles everything for testing teams.",
    industry: "Testing",
    brandColors: { primary: "#000", secondary: "#111", accent: "#222" },
    hero: {
      headline: "Test",
      subheadline: "Sub",
      cta: "CTA",
    },
    features: [
      { title: "Qualify", description: "Qualifies leads", icon: "Star" },
      { title: "Route", description: "Routes chats", icon: "Phone" },
      { title: "Schedule", description: "Schedules demos", icon: "Calendar" },
    ],
    pricing: {
      starter: { price: 10, features: ["Starter"] },
      professional: { price: 30, features: ["Pro"] },
      enterprise: { price: 100, features: ["Enterprise"] },
    },
    useCases: [{ title: "Demo", description: "Demo use case" }],
    faqs: [{ question: "Q", answer: "A" }],
    chatbot: {
      enabled: true,
      greeting: "👋 Hi there!",
      quickReplies: ["Pricing", "Demo", "Help"],
    },
  },
];

vi.mock("@/templates/business-templates", () => ({
  getAllTemplates: () => mockTemplates,
}));

import BusinessTemplates from "../BusinessTemplates";

describe("BusinessTemplates", () => {
  it("renders template cards with deployment CTA", () => {
    render(<BusinessTemplates />);

    expect(screen.getByText(/template library/i)).toBeInTheDocument();
    expect(screen.getByText("Test Template")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /deploy test template/i })).toBeInTheDocument();
  });
});
