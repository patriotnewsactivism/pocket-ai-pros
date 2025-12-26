import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NewFeatures } from "../NewFeatures";

describe("NewFeatures", () => {
  it("renders headline and badge", () => {
    render(<NewFeatures />);

    expect(screen.getByText(/new in buildmybot.app/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /everything you need to launch fast/i })).toBeInTheDocument();
  });

  it("shows all shipped feature cards", () => {
    render(<NewFeatures />);

    const featureTitles = [
      "Complete Payment System",
      "Legal & Compliance Stack",
      "Email Automation",
      "Analytics & Tracking",
      "Live Chat Widget",
      "One-Command Deployment",
    ];

    featureTitles.forEach(title => {
      const matches = screen.getAllByText(title);
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
