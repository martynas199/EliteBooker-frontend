// ***********************************************************
// Cypress Support Index - Loads before all tests
// ***********************************************************

// Import custom commands
import "./commands";

// Import Testing Library commands
import "@testing-library/cypress/add-commands";

// Hide fetch/XHR requests in command log (optional)
// const app = window.top;
// if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
//   const style = app.document.createElement('style');
//   style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
//   style.setAttribute('data-hide-command-log-request', '');
//   app.document.head.appendChild(style);
// }

// Global before hook - runs once before all tests
before(() => {
  cy.log("🚀 Starting E2E test suite");
});

// Global after hook - runs once after all tests
after(() => {
  cy.log("✅ E2E test suite complete");
});

// Before each test
beforeEach(() => {
  // Clear localStorage
  cy.clearLocalStorage();

  // Intercept common API calls
  cy.intercept("POST", "**/api/auth/login").as("login");
  cy.intercept("GET", "**/api/salon").as("getSalon");
  cy.intercept("GET", "**/api/services*").as("getServices");
  cy.intercept("GET", "**/api/specialists*").as("getStaff");
  cy.intercept("GET", "**/api/availability/slots*").as("getSlots");
  cy.intercept("POST", "**/api/checkout").as("checkout");
  cy.intercept("POST", "**/api/appointments").as("createBooking");
});

// After each test
afterEach(function () {
  // Take screenshot on test failure
  if (this.currentTest.state === "failed") {
    cy.screenshot(`failed-${this.currentTest.title}`, { capture: "fullPage" });
  }
});

// Handle uncaught exceptions
Cypress.on("uncaught:exception", (err, runnable) => {
  // Prevent Cypress from failing tests on certain expected errors
  // Return false to prevent the error from failing the test

  // Ignore specific errors (add as needed)
  if (err.message.includes("ResizeObserver loop")) {
    return false;
  }

  if (err.message.includes("hydration")) {
    return false;
  }

  // Allow the error to fail the test for other cases
  return true;
});
