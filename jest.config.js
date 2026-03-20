/** @type {import('jest').Config} */
module.exports = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.base.json",
      },
    ],
  },
  testMatch: ["**/experiments/*/src/**/*.test.{ts,tsx}"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  modulePathIgnorePatterns: ["dist"],
  passWithNoTests: true,
  clearMocks: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  collectCoverageFrom: [
    "experiments/*/src/**/*.{ts,tsx}",
    "!experiments/*/src/**/feature.ts",
    "!experiments/*/src/**/*.test.{ts,tsx}",
  ],
  moduleNameMapper: {
    "^electron$": "identity-obj-proxy",
  },
};