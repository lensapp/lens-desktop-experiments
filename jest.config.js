// Published @lensapp/* packages are still pre-rename builds importing the DI packages
// from @lensapp. Resolving those specifiers to the single @k8slens copy keeps one
// module identity, so injectables register once instead of twice. Drop this once the
// @lensapp packages are republished against @k8slens.
const bridgedToK8slens = [
  "composable-responsibilities",
  "element-components",
  "feature-core",
  "fp",
  "injectable",
  "injectable-extension-for-mobx",
  "injectable-react",
];

/** @type {import('jest').Config} */
module.exports = {
  transform: {
    "^.+\\.(t|j)sx?$": ["@k8slens/package-build/transformer"],
  },
  testEnvironment: "jest-fixed-jsdom",
  globalSetup: "@lensapp/jest/jest-global-setup",
  testMatch: ["**/experiments/*/src/**/*.test.{ts,tsx}"],
  // "/.claude/" keeps a git worktree checked out under it from being collected twice
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/.claude/"],
  modulePathIgnorePatterns: ["dist"],
  passWithNoTests: true,
  clearMocks: true,
  setupFilesAfterEnv: [
    "jest-canvas-mock",
    "@lensapp/jest/setup-react-tests",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(@k8slens|@lensapp|uuid)/)",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  collectCoverageFrom: [
    "experiments/*/src/**/*.{ts,tsx}",
    "!experiments/*/src/**/feature.ts",
    "!experiments/*/src/**/*.test.{ts,tsx}",
  ],
  moduleNameMapper: {
    ...Object.fromEntries(
      bridgedToK8slens.map((name) => [`^@lensapp/${name}$`, `@k8slens/${name}`]),
    ),
    "^electron$": "identity-obj-proxy",
    "\\.(css|scss)$": "identity-obj-proxy",
  },
};
