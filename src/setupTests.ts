import "@testing-library/jest-dom";

// window.confirm のモック（シンプルな関数）
Object.defineProperty(window, "confirm", {
  writable: true,
  configurable: true,
  value: () => true,
});

// View Transition API のモック（シンプルな関数）
Object.defineProperty(document, "startViewTransition", {
  writable: true,
  configurable: true,
  value: (callback: () => void) => callback(),
});

