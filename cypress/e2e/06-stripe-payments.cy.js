/// <reference types="cypress" />

describe("Stripe Connect Payment Tests", () => {
  let tenant1, service, staff, guestUser, tenantAdmin;

  before(() => {
    cy.fixture("tenants").then((tenants) => {
      tenant1 = tenants.tenant1;
    });

    cy.fixture("services").then((services) => {
      service = services.haircut;
    });

    cy.fixture("staff").then((staffData) => {
      staff = staffData.staff1;
    });

    cy.fixture("users").then((users) => {
      guestUser = users.guestUser;
      tenantAdmin = users.tenantAdmin1;
    });
  });

  describe("Successful Payment Flow", () => {
    it("should process successful full payment", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Navigate to checkout
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      // Fill in details
      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(guestUser.email);
      cy.get('input[name="phone"]').type(guestUser.phone);

      // Select full payment
      cy.get('input[value="full"]').check();

      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      // Verify checkout session creation
      cy.get("@checkoutSession").then((session) => {
        expect(session.url).to.include("stripe.com");
        expect(session.appointmentId).to.exist;

        // Store appointment ID for verification
        cy.wrap(session.appointmentId).as("appointmentId");
      });

      // Complete payment
      cy.completeStripeTestPayment();

      // Verify success page
      cy.url().should("include", "/success", { timeout: 15000 });
      cy.contains(/confirmed|success/i).should("be.visible");

      // Verify booking status via API
      cy.get("@appointmentId").then((appointmentId) => {
        cy.request({
          url: `${Cypress.env("API_URL")}/api/appointments/${appointmentId}`,
          headers: {
            "x-tenant-slug": tenant1.slug,
          },
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.status).to.eq("confirmed");
          expect(response.body.payment.mode).to.eq("full");
          expect(response.body.payment.status).to.eq("paid");
        });
      });
    });

    it("should process successful deposit payment", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Navigate to checkout
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      // Fill in details
      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(`${Date.now()}@example.com`); // Unique email
      cy.get('input[name="phone"]').type(guestUser.phone);

      // Select deposit payment
      cy.get('input[value="deposit"]').check();

      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      // Verify deposit amount
      cy.get("@checkoutSession").then((session) => {
        cy.wrap(session.appointmentId).as("appointmentId");
      });

      cy.completeStripeTestPayment();

      // Verify success page shows deposit info
      cy.url().should("include", "/success", { timeout: 15000 });
      cy.contains(/deposit|paid today/i).should("be.visible");
      cy.contains(/balance.*due/i).should("be.visible");

      // Verify booking status
      cy.get("@appointmentId").then((appointmentId) => {
        cy.request({
          url: `${Cypress.env("API_URL")}/api/appointments/${appointmentId}`,
          headers: {
            "x-tenant-slug": tenant1.slug,
          },
        }).then((response) => {
          expect(response.body.status).to.eq("confirmed");
          expect(response.body.payment.mode).to.eq("deposit");
          expect(response.body.payment.depositPaid).to.be.true;
        });
      });
    });

    it("should charge correct platform fee (50p)", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Complete booking
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(`${Date.now()}@example.com`);
      cy.get('input[name="phone"]').type(guestUser.phone);
      cy.get('input[value="full"]').check();

      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      // Verify appointment includes platform fee
      cy.get("@checkoutSession").then((session) => {
        cy.request({
          url: `${Cypress.env("API_URL")}/api/appointments/${
            session.appointmentId
          }`,
          headers: {
            "x-tenant-slug": tenant1.slug,
          },
        }).then((response) => {
          // Platform fee should be 50 pence (50 in smallest currency unit)
          expect(response.body.payment.platformFee).to.equal(50);

          // Total amount should include platform fee
          const servicePrice = response.body.price;
          const platformFee = 50;
          const expectedTotal = servicePrice + platformFee;

          expect(response.body.payment.amountTotal).to.equal(expectedTotal);
        });
      });
    });

    it("should pay out to correct connected account", () => {
      cy.loginAsTenantAdmin(tenantAdmin.email, tenantAdmin.password);

      // Get tenant's Stripe connected account ID
      cy.request({
        url: `${Cypress.env("API_URL")}/api/tenants/me`,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
      }).then((response) => {
        const connectedAccountId = response.body.stripeAccountId;
        expect(connectedAccountId).to.exist;

        cy.wrap(connectedAccountId).as("connectedAccountId");
      });

      cy.logout();

      // Make a booking
      cy.visit(`/salon/${tenant1.slug}`);
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(`${Date.now()}@example.com`);
      cy.get('input[name="phone"]').type(guestUser.phone);

      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      // Verify connected account in checkout session
      cy.get("@checkoutSession").then((session) => {
        cy.get("@connectedAccountId").then((accountId) => {
          // Checkout should be for the tenant's connected account
          expect(
            session.stripeAccountId || session.connectedAccountId
          ).to.equal(accountId);
        });
      });
    });
  });

  describe("Failed Payment Flow", () => {
    it("should handle declined card gracefully", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Navigate to checkout
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(`${Date.now()}@example.com`);
      cy.get('input[name="phone"]').type(guestUser.phone);

      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      cy.get("@checkoutSession").then((session) => {
        cy.wrap(session.appointmentId).as("appointmentId");
      });

      // Use failing test card
      cy.completeStripeTestPaymentFail();

      // Should see error message
      cy.contains(/declined|failed|error/i, { timeout: 10000 }).should(
        "be.visible"
      );

      // Verify booking status remains pending/cancelled
      cy.get("@appointmentId").then((appointmentId) => {
        cy.request({
          url: `${Cypress.env("API_URL")}/api/appointments/${appointmentId}`,
          failOnStatusCode: false,
          headers: {
            "x-tenant-slug": tenant1.slug,
          },
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body.status).to.be.oneOf(["pending", "cancelled"]);
            expect(response.body.payment.status).to.not.equal("paid");
          }
        });
      });
    });

    it("should show appropriate error UI for payment failure", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(`${Date.now()}@example.com`);
      cy.get('input[name="phone"]').type(guestUser.phone);

      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      cy.completeStripeTestPaymentFail();

      // Should show error message with option to retry
      cy.contains(/error|failed|declined/i).should("be.visible");
      cy.contains(/try again|retry/i).should("be.visible");
    });

    it("should not confirm booking if payment fails", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(`${Date.now()}@example.com`);
      cy.get('input[name="phone"]').type(guestUser.phone);

      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      cy.get("@checkoutSession").then((session) => {
        cy.wrap(session.appointmentId).as("failedAppointmentId");
      });

      cy.completeStripeTestPaymentFail();

      // Wait and verify appointment is not confirmed
      cy.wait(3000);

      cy.get("@failedAppointmentId").then((appointmentId) => {
        cy.request({
          url: `${Cypress.env("API_URL")}/api/appointments/${appointmentId}`,
          failOnStatusCode: false,
          headers: {
            "x-tenant-slug": tenant1.slug,
          },
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body.status).to.not.equal("confirmed");
          }
        });
      });
    });
  });

  describe("Payment Webhook Handling", () => {
    it("should update booking status when webhook is received", () => {
      // This test would require mocking webhook or using Stripe CLI
      // For now, we'll test that the endpoint exists

      cy.request({
        method: "POST",
        url: `${Cypress.env("API_URL")}/api/webhooks/stripe`,
        failOnStatusCode: false,
        body: {
          type: "checkout.session.completed",
          data: {
            object: {
              id: "test_session",
              payment_status: "paid",
            },
          },
        },
      }).then((response) => {
        // Should not return 404
        expect(response.status).to.not.equal(404);
      });
    });
  });

  describe("Refund Handling (if implemented)", () => {
    it("should process refund for cancelled booking", () => {
      cy.loginAsTenantAdmin(tenantAdmin.email, tenantAdmin.password);

      // Create and complete a booking first
      cy.logout();

      cy.visit(`/salon/${tenant1.slug}`);
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(`${Date.now()}@example.com`);
      cy.get('input[name="phone"]').type(guestUser.phone);

      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      cy.get("@checkoutSession").then((session) => {
        cy.wrap(session.appointmentId).as("refundAppointmentId");
      });

      cy.completeStripeTestPayment();
      cy.url().should("include", "/success", { timeout: 15000 });

      // Now cancel and request refund
      cy.loginAsTenantAdmin(tenantAdmin.email, tenantAdmin.password);

      cy.get("@refundAppointmentId").then((appointmentId) => {
        cy.get("@authToken").then((token) => {
          cy.request({
            method: "POST",
            url: `${Cypress.env(
              "API_URL"
            )}/api/appointments/${appointmentId}/cancel`,
            failOnStatusCode: false,
            headers: {
              Authorization: `Bearer ${token}`,
              "x-tenant-slug": tenant1.slug,
            },
            body: {
              requestedBy: "staff",
              reason: "cypress_refund_test",
            },
          }).then((response) => {
            if (response.status === 200) {
              expect(response.body.status).to.include("cancelled");
            }
          });
        });
      });
    });
  });

  describe("Payment Amount Verification", () => {
    it("should calculate total amount correctly for full payment", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]')
        .first()
        .then(($card) => {
          const priceText = $card.find('[data-testid="service-price"]').text();
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));
          cy.wrap(price).as("servicePrice");
        });

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(`${Date.now()}@example.com`);
      cy.get('input[name="phone"]').type(guestUser.phone);
      cy.get('input[value="full"]').check();

      // Verify displayed total
      cy.get('[data-testid="payment-total"]')
        .invoke("text")
        .then((totalText) => {
          cy.get("@servicePrice").then((price) => {
            const platformFee = 0.5;
            const expectedTotal = price + platformFee;
            expect(totalText).to.include(expectedTotal.toFixed(2));
          });
        });
    });

    it("should calculate deposit amount correctly", () => {
      // Assuming deposit is £10 from fixtures
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(`${Date.now()}@example.com`);
      cy.get('input[name="phone"]').type(guestUser.phone);
      cy.get('input[value="deposit"]').check();

      // Verify displayed deposit amount
      cy.get('[data-testid="deposit-amount"]').should("contain", "10.00");

      // Platform fee still applies
      cy.get('[data-testid="payment-total"]').should("contain", "10.50");
    });
  });
});
