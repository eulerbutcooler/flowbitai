const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3001",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    env: {
      apiUrl: "http://localhost:3000",
      supportAppUrl: "http://localhost:3002"
    },
    retries: {
      runMode: 2,
      openMode: 0
    }
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack"
    }
  }
})
