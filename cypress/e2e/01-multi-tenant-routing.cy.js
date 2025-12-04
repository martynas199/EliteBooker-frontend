/// <reference types="cypress" />

describe("Multi-Tenant Routing & Isolation", () => {
  let tenant1, tenant2;

  before(() => {
    // Load fixtures
    cy.fixture("tenants").then((tenants) => {
      tenant1 = tenants.tenant1;
      tenant2 = tenants.tenant2;
    });
  });

  describe("Tenant Landing Page", () => {
    it("should load tenant1 landing page with correct branding", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Check tenant name is displayed
      cy.contains(tenant1.name, { timeout: 10000 }).should("be.visible");

      // Verify page title
      cy.title().should("include", tenant1.name);
    });

    it("should load tenant2 landing page with different branding", () => {
      cy.visit(`/salon/${tenant2.slug}`);

      // Check tenant2 name
      cy.contains(tenant2.name, { timeout: 10000 }).should("be.visible");

      // Should NOT show tenant1 data
      cy.contains(tenant1.name).should("not.exist");
    });

    it("should display only tenant1 services on tenant1 page", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Services section should exist
      cy.contains("Services", { timeout: 10000 }).should("be.visible");

      // Should have services listed
      cy.get('[data-testid="service-card"]').should(
        "have.length.greaterThan",
        0
      );

      // Intercept services API and verify tenant isolation
      cy.intercept("GET", "**/api/services*", (req) => {
        expect(req.headers["x-tenant-slug"]).to.equal(tenant1.slug);
      }).as("getServicesIsolated");

      cy.reload();
      cy.wait("@getServicesIsolated");
    });

    it("should display only tenant1 staff on tenant1 page", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Wait for page to load
      cy.contains(tenant1.name, { timeout: 10000 }).should("be.visible");

      // Verify tenant isolation in API request
      cy.intercept("GET", "**/api/beauticians*", (req) => {
        expect(req.headers["x-tenant-slug"]).to.equal(tenant1.slug);
      }).as("getStaffIsolated");

      cy.reload();
      cy.wait("@getStaffIsolated");
    });

    it("should show 404 for non-existent tenant", () => {
      cy.visit("/salon/nonexistent-salon", { failOnStatusCode: false });

      // Should show error message or 404 page
      cy.contains(/not found|404/i).should("be.visible");
    });

    it("should not allow access to inactive tenant", () => {
      const inactiveTenant = "disabled-salon";

      // Visit the inactive tenant page
      cy.visit(`/salon/${inactiveTenant}`, { failOnStatusCode: false });

      // Should show "Salon Not Found" error message
      cy.contains(/salon not found|not found/i, { timeout: 10000 }).should(
        "be.visible"
      );
    });
  });

  describe("Tenant Data Isolation", () => {
    it("should not leak tenant1 data when viewing tenant2", () => {
      // Visit tenant1
      cy.visit(`/salon/${tenant1.slug}`);

      // Get tenant1 service names
      let tenant1Services = [];
      cy.get('[data-testid="service-card"]', { timeout: 10000 }).each(($el) => {
        tenant1Services.push($el.text());
      });

      // Visit tenant2
      cy.visit(`/salon/${tenant2.slug}`);

      // Verify tenant1 services don't appear on tenant2 page
      tenant1Services.forEach((serviceName) => {
        cy.get('[data-testid="service-card"]').should(
          "not.contain",
          serviceName
        );
      });
    });

    it("should maintain tenant context throughout navigation", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Click on services
      cy.contains("Services").click();
      cy.url().should("include", `/salon/${tenant1.slug}`);

      // Click on a service
      cy.get('[data-testid="service-card"]').first().click();
      cy.url().should("include", `/salon/${tenant1.slug}`);

      // Navigate back
      cy.go("back");
      cy.url().should("include", `/salon/${tenant1.slug}`);
    });

    it("should send correct tenant header in all API requests", () => {
      // Intercept all API calls and verify header
      cy.intercept("**/api/**", (req) => {
        // All tenant-specific API calls should have the header
        // (except for /api/tenants/slug which is public and doesn't need tenant header)
        if (!req.url.includes("/api/tenants/slug")) {
          expect(req.headers["x-tenant-slug"]).to.equal(tenant1.slug);
        }
      }).as("apiCalls");

      cy.visit(`/salon/${tenant1.slug}`);

      // Wait for page to load - services should be visible
      cy.get('[data-testid="service-card"]', { timeout: 10000 }).should(
        "exist"
      );
    });
  });

  describe("URL Routing & Navigation", () => {
    it("should handle direct URL access to tenant pages", () => {
      cy.visit(`/salon/${tenant1.slug}/services`);
      cy.url().should("include", `/salon/${tenant1.slug}/services`);
      cy.contains("Services").should("be.visible");
    });

    it("should handle back/forward browser navigation", () => {
      cy.visit(`/salon/${tenant1.slug}`);
      cy.get('[data-testid="service-card"]').first().click();

      cy.go("back");
      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}/salon/${tenant1.slug}`
      );

      cy.go("forward");
      cy.url().should("include", `/salon/${tenant1.slug}`);
    });

    it("should preserve tenant context on page refresh", () => {
      cy.visit(`/salon/${tenant1.slug}`);
      cy.reload();

      cy.url().should("include", `/salon/${tenant1.slug}`);
      cy.contains(tenant1.name).should("be.visible");
    });
  });

  describe("Cross-Tenant Navigation", () => {
    it("should allow switching between tenants via URL", () => {
      cy.visit(`/salon/${tenant1.slug}`);
      cy.contains(tenant1.name).should("be.visible");

      cy.visit(`/salon/${tenant2.slug}`);
      cy.contains(tenant2.name).should("be.visible");
      cy.contains(tenant1.name).should("not.exist");
    });

    it("should clear tenant context when returning to platform homepage", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.visit("/");
      cy.url().should("eq", `${Cypress.config().baseUrl}/`);

      // Platform homepage should not show tenant-specific content
      cy.contains(tenant1.name).should("not.exist");
    });
  });
});
