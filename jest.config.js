/** @type {import('jest').Config} */
module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": ["@lensapp/package-build/transformer"],
  },
  testEnvironment: "jest-fixed-jsdom",
  globalSetup: "@lensapp/jest/jest-global-setup",
  testMatch: ["**/experiments/*/src/**/*.test.{ts,tsx}"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  modulePathIgnorePatterns: ["dist"],
  passWithNoTests: true,
  clearMocks: true,
  setupFilesAfterEnv: [
    "jest-canvas-mock",
    "@lensapp/jest/setup-react-tests",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(@lensapp|uuid)/)",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  collectCoverageFrom: [
    "experiments/*/src/**/*.{ts,tsx}",
    "!experiments/*/src/**/feature.ts",
    "!experiments/*/src/**/*.test.{ts,tsx}",
  ],
  moduleNameMapper: {
    "^electron$": "identity-obj-proxy",
    "\\.(css|scss)$": "identity-obj-proxy",
  },
};
