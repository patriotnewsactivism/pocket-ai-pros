import "@testing-library/jest-dom/vitest";

// Provide fallbacks for APIs used by Radix components in tests.
if (!window.matchMedia) {
  // @ts-expect-error - matchMedia is not defined in jsdom by default
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
    media: "",
  });
}
