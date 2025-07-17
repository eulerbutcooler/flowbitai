module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/api"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: ["api/**/*.{ts,js}", "!api/**/*.d.ts"],
  moduleFileExtensions: ["js", "json", "node"],
  setupFilesAfterEnv: [],
};
