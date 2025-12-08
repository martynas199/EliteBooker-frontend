/// <reference types="cypress" />

describe("Guest Checkout Flow (End-to-End)", () => {
  let tenant1, service, staff, guestUser;

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
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe("Complete Guest Booking Flow", () => {
    it("should complete full booking flow: service → staff → time → details → payment", () => {
      // Step 1: Visit tenant landing page
      cy.visit(`/salon/${tenant1.slug}`);
      cy.contains(tenant1.name).should("be.visible");

      // Step 2: Select a service
      cy.get('[data-testid="service-card"]').first().click();
      cy.url().should("include", `/salon/${tenant1.slug}`);

      // Should see service details
      cy.contains("Select").click();

      // Step 3: Select staff member (or skip for "any available")
      cy.url().should("include", "specialists");

      // Select specific staff member
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      // Step 4: Select date and time slot
      cy.url().should("include", "times");
      cy.wait("@getSlots");

      // Select a date (today + 2 days to ensure availability)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dateStr = futureDate.toISOString().split("T")[0];

      cy.get(`[data-date="${dateStr}"]`).click();

      // Wait for slots to load
      cy.get('[data-testid="time-slot"]').should("exist");

      // Select first available time slot
      cy.get('[data-testid="time-slot"]').first().click();

      // Confirm selection
      cy.contains("Continue").click();

      // Step 5: Fill in guest details
      cy.url().should("include", "checkout");

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(guestUser.email);
      cy.get('input[name="phone"]').type(guestUser.phone);

      // Optional: Add notes
      cy.get('textarea[name="notes"]').type(
        "Looking forward to my appointment!"
      );

      // Step 6: Proceed to payment
      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      // Step 7: Complete Stripe payment (test mode)
      // Should be redirected to Stripe
      cy.url().should("include", "checkout.stripe.com");

      // Fill in test card details
      cy.completeStripeTestPayment();

      // Step 8: Verify confirmation page
      cy.url().should("include", "/success", { timeout: 15000 });

      // Should see confirmation message
      cy.contains(/confirmed|success/i).should("be.visible");

      // Should see booking details
      cy.contains(guestUser.name).should("be.visible");
      cy.contains(guestUser.email).should("be.visible");

      // Should see "Back to Home" button
      cy.contains("Back to Home").should("be.visible").click();

      // Should return to tenant home
      cy.url().should("include", `/salon/${tenant1.slug}`);
    });

    it('should handle "any available staff" booking flow', () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Select service
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();

      // Skip staff selection (choose "any available")
      cy.contains("Any Available").click();

      // Should go directly to time selection
      cy.url().should("include", "times");
      cy.wait("@getSlots");

      // Continue with booking
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      // Fill in details and complete
      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(guestUser.email);
      cy.get('input[name="phone"]').type(guestUser.phone);

      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      // Verify Stripe redirect
      cy.url().should("include", "stripe.com");
    });

    it("should show appropriate error for invalid email", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Navigate to checkout
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      // Fill in with invalid email
      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type("invalid-email");
      cy.get('input[name="phone"]').type(guestUser.phone);

      cy.contains("Proceed to Payment").click();

      // Should show validation error
      cy.contains(/invalid email|email is required/i).should("be.visible");
    });

    it("should show error for invalid phone number", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Navigate to checkout
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      // Fill in with invalid phone
      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(guestUser.email);
      cy.get('input[name="phone"]').type("123"); // Too short

      cy.contains("Proceed to Payment").click();

      // Should show validation error
      cy.contains(/invalid phone|phone number/i).should("be.visible");
    });

    it("should preserve booking data on page refresh before payment", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Navigate to checkout and fill form
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(guestUser.email);
      cy.get('input[name="phone"]').type(guestUser.phone);

      // Refresh page
      cy.reload();

      // Form should preserve data (if using localStorage/Redux persist)
      cy.get('input[name="name"]').should("have.value", guestUser.name);
    });

    it("should allow user to go back and change selections", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Select service
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();

      // Select staff
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      // Go back to change staff
      cy.contains("Back").click();
      cy.url().should("include", "specialists");

      // Select different staff
      cy.get('[data-testid="staff-card"]').eq(1).click();
      cy.contains("Book").click();

      // Should proceed to time selection
      cy.url().should("include", "times");
    });

    it("should display booking summary before payment", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Complete flow to checkout page
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      // Should see booking summary
      cy.get('[data-testid="booking-summary"]').should("be.visible");

      // Should show service name
      cy.get('[data-testid="booking-summary"]').should("contain", service.name);

      // Should show price
      cy.get('[data-testid="booking-summary"]').should("contain", "£");

      // Should show staff name
      cy.get('[data-testid="booking-summary"]').should("contain", staff.name);
    });
  });

  describe("Payment Cancellation", () => {
    it("should handle user cancelling payment on Stripe page", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Navigate to payment
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      cy.get('input[name="name"]').type(guestUser.name);
      cy.get('input[name="email"]').type(guestUser.email);
      cy.get('input[name="phone"]').type(guestUser.phone);

      cy.contains("Proceed to Payment").click();
      cy.wait("@checkout");

      // Get checkout session for cancel URL
      cy.get("@checkoutSession").then((session) => {
        const appointmentId = session.appointmentId;

        // Visit cancel page
        cy.visit(
          `/salon/${tenant1.slug}/cancel?appointmentId=${appointmentId}`
        );

        // Should see cancellation message
        cy.contains(/cancelled|canceled/i).should("be.visible");

        // Should have button to return to booking
        cy.contains("Return to Booking").should("be.visible").click();

        // Should return to tenant page
        cy.url().should("include", `/salon/${tenant1.slug}`);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle no available time slots gracefully", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      // Try to select a date far in the past (should have no slots)
      // Or mock API to return no slots
      cy.intercept("GET", "**/api/availability/slots*", {
        statusCode: 200,
        body: { slots: [] },
      }).as("getNoSlots");

      cy.reload();
      cy.wait("@getNoSlots");

      // Should show "no slots available" message
      cy.contains(/no.*available|fully booked/i).should("be.visible");
    });

    it("should handle service not found", () => {
      cy.visit(`/salon/${tenant1.slug}/service/nonexistent-id`, {
        failOnStatusCode: false,
      });

      // Should show error message
      cy.contains(/not found|service unavailable/i).should("be.visible");
    });

    it("should prevent booking when tenant is inactive", () => {
      cy.request({
        url: `${Cypress.env("API_URL")}/api/checkout`,
        method: "POST",
        failOnStatusCode: false,
        headers: {
          "x-tenant-slug": "disabled-salon",
        },
        body: {
          serviceId: "some-id",
          start: new Date().toISOString(),
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([403, 404]);
      });
    });
  });

  describe("Mobile Responsiveness", () => {
    it("should complete booking flow on mobile viewport", () => {
      cy.viewport("iphone-x");

      cy.visit(`/salon/${tenant1.slug}`);

      // Complete booking on mobile
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get('[data-testid="time-slot"]').first().click();
      cy.contains("Continue").click();

      // Form should be usable on mobile
      cy.get('input[name="name"]').should("be.visible").type(guestUser.name);
      cy.get('input[name="email"]').should("be.visible").type(guestUser.email);
      cy.get('input[name="phone"]').should("be.visible").type(guestUser.phone);

      cy.contains("Proceed to Payment").should("be.visible");
    });
  });
});
