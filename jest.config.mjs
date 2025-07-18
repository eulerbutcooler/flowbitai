export default {
  testEnvironment: "node",
  roots: ["<rootDir>/api"],
  testMatch: ["**/__tests__/**/*.{js,ts}", "**/?(*.)+(spec|test).{js,ts}"],
  collectCoverageFrom: ["api/**/*.{ts,js}", "!api/**/*.d.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  setupFilesAfterEnv: [],
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  transformIgnorePatterns: ["node_modules/(?!(@jest/.*|jest-.*|@babel/.*)/)"],
  transform: {
    "^.+\\.(t|j)s$": ["ts-jest", { useESM: true }],
  },
};
