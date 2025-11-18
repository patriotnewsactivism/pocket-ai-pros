import { describe, it, expect } from "vitest";
import { getAvailableBusinessTypes, getBusinessTemplate } from "./chatbot";
import { BUSINESS_TEMPLATES } from "@/templates/business-templates";

describe("chatbot template helpers", () => {
  it("returns template details for a supported business type", () => {
    const template = getBusinessTemplate("saas");

    expect(template.name).toBe(BUSINESS_TEMPLATES.saas.name);
    expect(template.quickReplies).toEqual(BUSINESS_TEMPLATES.saas.chatbot.quickReplies);
    expect(template.capabilities.length).toBeGreaterThan(0);
  });

  it("falls back to the support template when an unknown type is requested", () => {
    const template = getBusinessTemplate("unknown" as keyof typeof BUSINESS_TEMPLATES);

    expect(template.name).toBe(BUSINESS_TEMPLATES.support.name);
    expect(template.quickReplies).toEqual(BUSINESS_TEMPLATES.support.chatbot.quickReplies);
  });

  it("lists all available business types", () => {
    const availableTypes = getAvailableBusinessTypes().sort();
    const templateKeys = Object.keys(BUSINESS_TEMPLATES).sort();

    expect(availableTypes).toEqual(templateKeys);
  });
});
