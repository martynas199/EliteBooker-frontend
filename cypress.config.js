import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Test isolation
    testIsolation: true,

    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },

    env: {
      // Use same origin (proxy) for API calls to enable cookie sharing
      API_URL: process.env.CYPRESS_API_URL || "http://localhost:5173",
      STRIPE_TEST_KEY: process.env.CYPRESS_STRIPE_TEST_KEY || "pk_test_...",
    },

    // Retry failed tests
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Spec pattern
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
