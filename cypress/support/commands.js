// ***********************************************************
// Cypress Support File - Custom Commands
// ***********************************************************

import "@testing-library/cypress/add-commands";

// ***********************************************************
// AUTHENTICATION COMMANDS
// ***********************************************************

/**
 * Login as tenant admin
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 */
Cypress.Commands.add("loginAsTenantAdmin", (email, password) => {
  // Use cy.session to persist login state across tests
  cy.session(
    `tenant-admin-${email}`,
    () => {
      // Use /api prefix (goes through Vite proxy for same-origin cookies)
      cy.request({
        method: "POST",
        url: "/api/auth/login",
        body: { email, password },
        failOnStatusCode: true,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("admin");
        expect(response.body.success).to.be.true;

        // Cookies are automatically stored by Cypress and will persist
        cy.wrap(response.body.admin).as("currentAdmin");
      });
    },
    {
      // Validate session by checking if /api/auth/me works
      validate() {
        cy.request({
          url: "/api/auth/me",
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
      },
    }
  );
});

/**
 * Login as super admin
 * @param {string} email - Super admin email
 * @param {string} password - Super admin password
 */
Cypress.Commands.add("loginAsSuperAdmin", (email, password) => {
  // Use cy.session to persist login state across tests
  cy.session(
    `super-admin-${email}`,
    () => {
      // Use /api prefix (goes through Vite proxy for same-origin cookies)
      cy.request({
        method: "POST",
        url: "/api/auth/login",
        body: { email, password },
        failOnStatusCode: true,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("admin");
        expect(response.body.admin.role).to.eq("super_admin");
        expect(response.body.success).to.be.true;

        // Cookies are automatically stored by Cypress and will persist
        cy.wrap(response.body.admin).as("currentAdmin");
      });
    },
    {
      // Validate session by checking if /api/auth/me works
      validate() {
        cy.request({
          url: "/api/auth/me",
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
      },
    }
  );
});

/**
 * Login via UI
 */
Cypress.Commands.add("loginViaUI", (email, password) => {
  cy.visit("/login");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("not.include", "/login");
});

/**
 * Logout
 */
Cypress.Commands.add("logout", () => {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
  cy.visit("/");
});

// ***********************************************************
// TENANT (BUSINESS) COMMANDS
// ***********************************************************

/**
 * Create a tenant/business
 * @param {object} tenantData - Tenant details
 * @returns {Cypress.Chainable} - Created tenant
 */
Cypress.Commands.add("createTenant", (tenantData) => {
  const apiUrl = Cypress.env("API_URL");

  cy.get("@authToken").then((token) => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/api/tenants`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: tenantData,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      cy.wrap(response.body).as("createdTenant");
      return cy.wrap(response.body);
    });
  });
});

/**
 * Get tenant by slug
 * @param {string} slug - Tenant slug
 */
Cypress.Commands.add("getTenantBySlug", (slug) => {
  const apiUrl = Cypress.env("API_URL");

  cy.request({
    method: "GET",
    url: `${apiUrl}/api/salon/${slug}`,
    headers: {
      "x-tenant-slug": slug,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    return cy.wrap(response.body);
  });
});

/**
 * Update tenant
 * @param {string} tenantId - Tenant ID
 * @param {object} updates - Updates to apply
 */
Cypress.Commands.add("updateTenant", (tenantId, updates) => {
  const apiUrl = Cypress.env("API_URL");

  cy.get("@authToken").then((token) => {
    cy.request({
      method: "PUT",
      url: `${apiUrl}/api/tenants/${tenantId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: updates,
    }).then((response) => {
      expect(response.status).to.eq(200);
      return cy.wrap(response.body);
    });
  });
});

/**
 * Delete tenant
 * @param {string} tenantId - Tenant ID
 */
Cypress.Commands.add("deleteTenant", (tenantId) => {
  const apiUrl = Cypress.env("API_URL");

  cy.get("@authToken").then((token) => {
    cy.request({
      method: "DELETE",
      url: `${apiUrl}/api/tenants/${tenantId}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 204]);
    });
  });
});

// ***********************************************************
// STAFF (BEAUTICIAN) COMMANDS
// ***********************************************************

/**
 * Create staff member
 * @param {object} staffData - Staff details
 * @param {string} tenantSlug - Tenant slug
 */
Cypress.Commands.add("createStaff", (staffData, tenantSlug) => {
  const apiUrl = Cypress.env("API_URL");

  cy.get("@authToken").then((token) => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/api/specialists`,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-slug": tenantSlug,
      },
      body: staffData,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      cy.wrap(response.body).as("createdStaff");
      return cy.wrap(response.body);
    });
  });
});

/**
 * Update staff member
 * @param {string} staffId - Staff ID
 * @param {object} updates - Updates to apply
 * @param {string} tenantSlug - Tenant slug
 */
Cypress.Commands.add("updateStaff", (staffId, updates, tenantSlug) => {
  const apiUrl = Cypress.env("API_URL");

  cy.get("@authToken").then((token) => {
    cy.request({
      method: "PUT",
      url: `${apiUrl}/api/specialists/${staffId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-slug": tenantSlug,
      },
      body: updates,
    }).then((response) => {
      expect(response.status).to.eq(200);
      return cy.wrap(response.body);
    });
  });
});

/**
 * Delete staff member
 * @param {string} staffId - Staff ID
 * @param {string} tenantSlug - Tenant slug
 */
Cypress.Commands.add("deleteStaff", (staffId, tenantSlug) => {
  const apiUrl = Cypress.env("API_URL");

  cy.get("@authToken").then((token) => {
    cy.request({
      method: "DELETE",
      url: `${apiUrl}/api/specialists/${staffId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-slug": tenantSlug,
      },
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 204]);
    });
  });
});

/**
 * Set staff availability
 * @param {string} staffId - Staff ID
 * @param {object} availability - Availability data
 * @param {string} tenantSlug - Tenant slug
 */
Cypress.Commands.add(
  "setStaffAvailability",
  (staffId, availability, tenantSlug) => {
    const apiUrl = Cypress.env("API_URL");

    cy.get("@authToken").then((token) => {
      cy.request({
        method: "PUT",
        url: `${apiUrl}/api/specialists/${staffId}/availability`,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-slug": tenantSlug,
        },
        body: availability,
      }).then((response) => {
        expect(response.status).to.eq(200);
        return cy.wrap(response.body);
      });
    });
  }
);

// ***********************************************************
// SERVICE COMMANDS
// ***********************************************************

/**
 * Create service
 * @param {object} serviceData - Service details
 * @param {string} tenantSlug - Tenant slug
 */
Cypress.Commands.add("createService", (serviceData, tenantSlug) => {
  const apiUrl = Cypress.env("API_URL");

  cy.get("@authToken").then((token) => {
    cy.request({
      method: "POST",
      url: `${apiUrl}/api/services`,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-slug": tenantSlug,
      },
      body: serviceData,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      cy.wrap(response.body).as("createdService");
      return cy.wrap(response.body);
    });
  });
});

/**
 * Update service
 * @param {string} serviceId - Service ID
 * @param {object} updates - Updates to apply
 * @param {string} tenantSlug - Tenant slug
 */
Cypress.Commands.add("updateService", (serviceId, updates, tenantSlug) => {
  const apiUrl = Cypress.env("API_URL");

  cy.get("@authToken").then((token) => {
    cy.request({
      method: "PUT",
      url: `${apiUrl}/api/services/${serviceId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-slug": tenantSlug,
      },
      body: updates,
    }).then((response) => {
      expect(response.status).to.eq(200);
      return cy.wrap(response.body);
    });
  });
});

/**
 * Delete service
 * @param {string} serviceId - Service ID
 * @param {string} tenantSlug - Tenant slug
 */
Cypress.Commands.add("deleteService", (serviceId, tenantSlug) => {
  const apiUrl = Cypress.env("API_URL");

  cy.get("@authToken").then((token) => {
    cy.request({
      method: "DELETE",
      url: `${apiUrl}/api/services/${serviceId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "x-tenant-slug": tenantSlug,
      },
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 204]);
    });
  });
});

// ***********************************************************
// BOOKING COMMANDS
// ***********************************************************

/**
 * Get available time slots
 * @param {string} serviceId - Service ID
 * @param {string} staffId - Staff ID (optional)
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} tenantSlug - Tenant slug
 */
Cypress.Commands.add(
  "getAvailableSlots",
  (serviceId, staffId, date, tenantSlug) => {
    const apiUrl = Cypress.env("API_URL");

    const params = new URLSearchParams({
      serviceId,
      date,
      ...(staffId && { beauticianId: staffId }),
    });

    cy.request({
      method: "GET",
      url: `${apiUrl}/api/availability/slots?${params.toString()}`,
      headers: {
        "x-tenant-slug": tenantSlug,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      return cy.wrap(response.body);
    });
  }
);

/**
 * Create booking
 * @param {object} bookingData - Booking details
 * @param {string} tenantSlug - Tenant slug
 */
Cypress.Commands.add("createBooking", (bookingData, tenantSlug) => {
  const apiUrl = Cypress.env("API_URL");

  cy.request({
    method: "POST",
    url: `${apiUrl}/api/bookings`,
    headers: {
      "x-tenant-slug": tenantSlug,
    },
    body: bookingData,
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201]);
    cy.wrap(response.body).as("createdBooking");
    return cy.wrap(response.body);
  });
});

// ***********************************************************
// STRIPE CHECKOUT COMMANDS
// ***********************************************************

/**
 * Initiate Stripe checkout
 * @param {object} checkoutData - Checkout details
 * @param {string} tenantSlug - Tenant slug
 */
Cypress.Commands.add("initiateStripeCheckout", (checkoutData, tenantSlug) => {
  const apiUrl = Cypress.env("API_URL");

  cy.request({
    method: "POST",
    url: `${apiUrl}/api/checkout`,
    headers: {
      "x-tenant-slug": tenantSlug,
    },
    body: checkoutData,
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property("url");
    cy.wrap(response.body).as("checkoutSession");
    return cy.wrap(response.body);
  });
});

/**
 * Complete Stripe test payment (mock)
 * Simulates successful Stripe payment using test card
 */
Cypress.Commands.add("completeStripeTestPayment", () => {
  // In test mode, Stripe provides test card numbers
  // 4242 4242 4242 4242 - Success
  cy.get('iframe[name*="stripe"]').then(($iframe) => {
    const $body = $iframe.contents().find("body");
    cy.wrap($body).find('input[name="cardnumber"]').type("4242424242424242");
    cy.wrap($body).find('input[name="exp-date"]').type("1228"); // 12/28
    cy.wrap($body).find('input[name="cvc"]').type("123");
    cy.wrap($body).find('input[name="postal"]').type("12345");
  });

  cy.get('button[type="submit"]').contains("Pay").click();
});

/**
 * Complete Stripe test payment with failing card
 */
Cypress.Commands.add("completeStripeTestPaymentFail", () => {
  // 4000 0000 0000 0002 - Card declined
  cy.get('iframe[name*="stripe"]').then(($iframe) => {
    const $body = $iframe.contents().find("body");
    cy.wrap($body).find('input[name="cardnumber"]').type("4000000000000002");
    cy.wrap($body).find('input[name="exp-date"]').type("1228");
    cy.wrap($body).find('input[name="cvc"]').type("123");
    cy.wrap($body).find('input[name="postal"]').type("12345");
  });

  cy.get('button[type="submit"]').contains("Pay").click();
});

// ***********************************************************
// UTILITY COMMANDS
// ***********************************************************

/**
 * Wait for API response
 */
Cypress.Commands.add("waitForAPI", (alias) => {
  cy.wait(alias).its("response.statusCode").should("be.oneOf", [200, 201]);
});

/**
 * Seed test database
 */
Cypress.Commands.add("seedDatabase", () => {
  const apiUrl = Cypress.env("API_URL");

  cy.request({
    method: "POST",
    url: `${apiUrl}/api/test/seed`,
    failOnStatusCode: false,
  });
});

/**
 * Clean test database
 */
Cypress.Commands.add("cleanDatabase", () => {
  const apiUrl = Cypress.env("API_URL");

  cy.request({
    method: "POST",
    url: `${apiUrl}/api/test/clean`,
    failOnStatusCode: false,
  });
});

/**
 * Check for console errors
 */
Cypress.Commands.add("checkConsoleErrors", () => {
  cy.window().then((win) => {
    const errors = win.console.error.calls?.all() || [];
    expect(errors).to.have.length(0);
  });
});

// ***********************************************************
// TYPE DEFINITIONS (for IDE autocomplete)
// ***********************************************************

// Add TypeScript definitions for better IDE support
/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
