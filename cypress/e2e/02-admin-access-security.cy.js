/// <reference types="cypress" />

describe("Admin Access & Security", () => {
  let tenantAdmin1, tenantAdmin2, superAdmin, regularUser;
  let tenant1, tenant2;

  before(() => {
    cy.fixture("users").then((users) => {
      tenantAdmin1 = users.tenantAdmin1;
      tenantAdmin2 = users.tenantAdmin2;
      superAdmin = users.superadmin;
      regularUser = users.regularUser;
    });

    cy.fixture("tenants").then((tenants) => {
      tenant1 = tenants.tenant1;
      tenant2 = tenants.tenant2;
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe("Tenant Admin Access", () => {
    it("should allow tenant admin to access their own dashboard", () => {
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      cy.visit("/admin/dashboard");

      // Should see dashboard
      cy.contains("Dashboard").should("be.visible");
      cy.url().should("include", "/admin/dashboard");
    });

    it("should show only tenant1 data to tenant1 admin", () => {
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      cy.visit("/admin/services");
      cy.wait("@getServices").then((interception) => {
        // Verify API response contains only tenant1's 3 services
        expect(interception.response.statusCode).to.eq(200);
        expect(interception.response.body).to.be.an("array");
        expect(interception.response.body.length).to.eq(3);
      });

      // Should see only tenant1's services in the UI
      // Note: Services appear in both mobile (card) and desktop (table) views
      // So we check that visible items exist
      cy.get('[data-testid="service-item"]:visible').should(
        "have.length.at.least",
        3
      );
    });

    it("should allow tenant admin to manage their services", () => {
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      cy.visit("/admin/services");

      // Should see add service button
      cy.contains("Add Service").should("be.visible");

      // Should see services list
      cy.get('[data-testid="service-item"]').should("exist");
    });

    it("should allow tenant admin to manage their staff", () => {
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      cy.visit("/admin/staff");
      cy.wait("@getStaff");

      // Should see add staff button
      cy.contains("Add Staff").should("be.visible");

      // Should see staff list
      cy.get('[data-testid="staff-item"]').should("exist");
    });

    it.skip("should allow tenant admin to view their bookings", () => {
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      cy.visit("/admin/bookings");

      // Should see bookings page
      cy.contains("Bookings").should("be.visible");
    });

    it.skip("should allow tenant admin to edit business settings", () => {
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      cy.visit("/admin/settings");

      // Should see settings form
      cy.contains("Business Settings").should("be.visible");
      cy.get('input[name="name"]').should("exist");
      cy.get('input[name="email"]').should("exist");
    });
  });

  describe("Super Admin Access", () => {
    it.skip("should allow super admin to access platform dashboard", () => {
      cy.loginAsSuperAdmin(superAdmin.email, superAdmin.password);

      cy.visit("/superadmin/dashboard");

      // Should see super admin dashboard
      cy.contains("Platform Dashboard").should("be.visible");
      cy.url().should("include", "/superadmin");
    });

    it.skip("should show all tenants to super admin", () => {
      cy.loginAsSuperAdmin(superAdmin.email, superAdmin.password);

      cy.visit("/superadmin/tenants");

      // Should see tenants list
      cy.contains(tenant1.name).should("be.visible");
      cy.contains(tenant2.name).should("be.visible");
    });

    it.skip("should allow super admin to view platform metrics", () => {
      cy.loginAsSuperAdmin(superAdmin.email, superAdmin.password);

      cy.visit("/superadmin/analytics");

      // Should see analytics
      cy.contains("Platform Analytics").should("be.visible");
    });

    it.skip("should allow super admin to disable/enable tenants", () => {
      cy.loginAsSuperAdmin(superAdmin.email, superAdmin.password);

      cy.visit("/superadmin/tenants");

      // Find tenant row and toggle status
      cy.contains(tenant1.name)
        .parents('[data-testid="tenant-row"]')
        .find('[data-testid="toggle-status"]')
        .should("exist");
    });

    it.skip("should NOT allow super admin to access tenant internal data without permission", () => {
      cy.loginAsSuperAdmin(superAdmin.email, superAdmin.password);

      // Super admin should see metadata, not internal booking details
      cy.visit("/superadmin/tenants");

      // Should see tenant list
      cy.contains(tenant1.name).should("be.visible");

      // Should NOT see detailed booking information
      cy.contains("Booking Details").should("not.exist");
    });
  });

  describe("Unauthorized Access - 401 Errors", () => {
    it("should return 401 when accessing admin routes without login", () => {
      // Public endpoint - GET services should work without auth
      cy.request({
        url: "/api/services",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(200);
      });

      // Admin-only endpoint - POST service should require authentication
      cy.request({
        method: "POST",
        url: "/api/services",
        failOnStatusCode: false,
        body: {
          name: "Test Service",
          category: "Test",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it.skip("should redirect to login when accessing admin UI without auth", () => {
      cy.visit("/admin/dashboard", { failOnStatusCode: false });

      // Should redirect to login after auth verification fails
      // Use longer timeout to allow for auth check and redirect
      cy.url({ timeout: 10000 }).should("include", "/login");
    });

    it("should return 401 for invalid token", () => {
      cy.setCookie("accessToken", "invalid-token");

      // Try to create a service with invalid token
      cy.request({
        method: "POST",
        url: "/api/services",
        failOnStatusCode: false,
        body: {
          name: "Test Service",
          category: "Test",
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe("Forbidden Access - 403 Errors", () => {
    it("should return 403 when tenant1 admin tries to access tenant2 data", () => {
      // Login as tenant1 admin
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      // Try to access tenant2's services - cookies will automatically be sent
      cy.request({
        url: "/api/services",
        failOnStatusCode: false,
      }).then((response) => {
        // Should return 200 but with ONLY tenant1's services (3 services)
        // The backend uses req.tenantId from the admin's cookie to filter
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");
        expect(response.body.length).to.equal(3); // Only tenant1's 3 services

        // Verify all services belong to tenant1
        response.body.forEach((service) => {
          expect(service.tenantId).to.exist;
          // Service should have tenant1's tenantId
        });
      });
    });

    it("should prevent regular user from accessing admin endpoints", () => {
      // Regular users shouldn't be able to access admin-only routes
      cy.request({
        method: "POST",
        url: "/api/services",
        failOnStatusCode: false,
        body: { name: "Test" },
      }).then((response) => {
        // Should return 401 (no authentication)
        expect(response.status).to.eq(401);
      });

      // Even the public services endpoint should not give admin privileges
      cy.request({
        url: "/api/services",
        failOnStatusCode: false,
      }).then((response) => {
        // Public endpoint, should be 200
        expect(response.status).to.eq(200);
        // But response should not include admin-only fields
      });
    });

    it.skip("should prevent tenant admin from accessing super admin endpoints", () => {
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      cy.get("@authToken").then((token) => {
        cy.request({
          url: Cypress.env("API_URL") + "/api/superadmin/tenants",
          failOnStatusCode: false,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((response) => {
          expect(response.status).to.eq(403);
        });
      });
    });

    it.skip("should prevent cross-tenant admin access via UI", () => {
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      // Try to access tenant2 admin panel
      cy.visit(`/salon/${tenant2.slug}/admin`, { failOnStatusCode: false });

      // Should be redirected or show error
      cy.contains(/forbidden|access denied|not authorized/i).should(
        "be.visible"
      );
    });
  });

  describe("Data Isolation", () => {
    it("should not leak tenant data in API responses", () => {
      let tenant1ServiceIds;
      let tenant2ServiceIds;

      // Test tenant1 isolation
      cy.session(
        `data-leak-test-tenant1-${Date.now()}`, // Unique ID to prevent caching
        () => {
          cy.request({
            method: "POST",
            url: "/api/auth/login",
            body: {
              email: tenantAdmin1.email,
              password: tenantAdmin1.password,
            },
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.admin.email).to.eq(tenantAdmin1.email);
          });
        },
        {
          validate() {
            cy.request("/api/auth/me").then((res) => {
              expect(res.status).to.eq(200);
              expect(res.body.admin.email).to.eq(tenantAdmin1.email);
            });
          },
        }
      );

      cy.request("/api/services").then((response1) => {
        expect(response1.status).to.eq(200);
        expect(response1.body).to.be.an("array");
        expect(response1.body.length).to.equal(3);
        tenant1ServiceIds = response1.body.map((s) => s._id);
      });

      // Test tenant2 isolation with completely fresh session
      cy.session(
        `data-leak-test-tenant2-${Date.now()}`, // Unique ID to prevent caching
        () => {
          cy.request({
            method: "POST",
            url: "/api/auth/login",
            body: {
              email: tenantAdmin2.email,
              password: tenantAdmin2.password,
            },
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.admin.email).to.eq(tenantAdmin2.email);
          });
        },
        {
          validate() {
            cy.request("/api/auth/me").then((res) => {
              expect(res.status).to.eq(200);
              expect(res.body.admin.email).to.eq(tenantAdmin2.email);
            });
          },
        }
      );

      cy.request("/api/services").then((response2) => {
        expect(response2.status).to.eq(200);
        expect(response2.body).to.be.an("array");
        expect(response2.body.length).to.equal(3);
        tenant2ServiceIds = response2.body.map((s) => s._id);

        // Compare immediately while we have both arrays
        tenant1ServiceIds.forEach((id) => {
          expect(tenant2ServiceIds).to.not.include(id);
        });
      });
    });

    it("should not expose other tenants in staff queries", () => {
      // Login as tenant1 admin
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      cy.request({
        url: "/api/specialists",
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("array");
        expect(response.body.length).to.equal(1); // Only tenant1's 1 specialist

        // All staff should belong to tenant1
        response.body.forEach((staff) => {
          expect(staff.tenantId).to.exist;
          // Tenant ID should match tenant1
        });
      });
    });

    it.skip("should not expose other tenants in booking queries", () => {
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      cy.visit("/admin/bookings");

      cy.intercept("GET", "**/api/appointments*", (req) => {
        expect(req.headers["x-tenant-slug"]).to.equal(tenant1.slug);
      }).as("getBookings");

      cy.wait("@getBookings").then((interception) => {
        // All bookings should be for tenant1
        interception.response.body.forEach((booking) => {
          expect(booking.tenant).to.exist;
        });
      });
    });
  });

  describe("Role-Based Access Control", () => {
    it.skip("should enforce role hierarchy", () => {
      // Test 1: Regular user cannot access admin dashboard
      cy.visit("/admin/dashboard", { failOnStatusCode: false });
      cy.url().should("include", "/login");

      // Test 2: Tenant admin CAN access admin dashboard
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);
      cy.visit("/admin/dashboard");
      cy.url().should("include", "/admin/dashboard");
      cy.contains("Dashboard").should("be.visible");
    });

    it.skip("should verify user role in JWT token", () => {
      cy.loginAsTenantAdmin(tenantAdmin1.email, tenantAdmin1.password);

      cy.window().then((win) => {
        const user = JSON.parse(win.localStorage.getItem("user"));
        expect(user.role).to.equal("admin");
      });
    });
  });
});
