import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const mockTemplates = {
  ecommerce: {
    id: "ecommerce",
    name: "Retail Assistant",
    description: "Handles customer shopping requests",
    industry: "Retail",
    brandColors: { primary: "#000", secondary: "#111", accent: "#222" },
    hero: { headline: "Sell more", subheadline: "Convert shoppers instantly", cta: "Start" },
    features: [
      { title: "Product finder", description: "Recommends products", icon: "Search" },
      { title: "Order tracker", description: "Tracks orders", icon: "Truck" },
      { title: "Return helper", description: "Manages returns", icon: "Refresh" },
    ],
    pricing: {
      starter: { price: 49, features: [] },
      professional: { price: 149, features: [] },
      enterprise: { price: 399, features: [] },
    },
    useCases: [],
    faqs: [],
    chatbot: {
      enabled: true,
      greeting: "Hi!",
      quickReplies: ["Pricing", "Track my order", "Return policy", "Talk to support"],
      persona: "Helpful",
      tone: "Friendly",
      capabilities: ["Answer questions"],
      knowledgeBase: {},
    },
  },
};

vi.mock("@/templates/business-templates", () => ({
  BUSINESS_TEMPLATES: mockTemplates,
}));

import TemplateShowcase from "../TemplateShowcase";

describe("TemplateShowcase", () => {
  it("renders template details with CTA link", () => {
    render(
      <MemoryRouter>
        <TemplateShowcase />
      </MemoryRouter>
    );

    expect(screen.getByText(/Retail Assistant/i)).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /Deploy Retail Assistant Template/i });
    expect(cta).toHaveAttribute("href", "/auth?template=ecommerce");
  });
});
