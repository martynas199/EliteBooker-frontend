/// <reference types="cypress" />

describe("Smart Time Slot Generator", () => {
  let tenant1, service, staff;
  let tenantAdmin;

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
      tenantAdmin = users.tenantAdmin1;
    });
  });

  describe("Working Hours Consideration", () => {
    it("should only show slots within staff working hours", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // Navigate to time slot selection
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      // Get slots for Monday
      const monday = getNextWeekday(1); // Monday
      cy.get(`[data-date="${monday}"]`).click();
      cy.wait("@getSlots");

      // Get all available time slots
      cy.get('[data-testid="time-slot"]').each(($slot) => {
        const time = $slot.attr("data-time");
        const hour = parseInt(time.split(":")[0]);

        // From fixture: Monday 09:00-17:00
        expect(hour).to.be.at.least(9);
        expect(hour).to.be.at.most(16); // Last slot starts at 16:00
      });
    });

    it("should not show slots for days when staff is not working", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();

      // Select staff who doesn't work on Sunday
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      // Try to get slots for Sunday
      const sunday = getNextWeekday(0); // Sunday
      cy.get(`[data-date="${sunday}"]`).click();
      cy.wait("@getSlots");

      // Should show "no available slots" or disabled
      cy.contains(/no.*available|closed/i).should("be.visible");
    });

    it("should respect different working hours for different staff", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();

      // Staff 1: 09:00-17:00
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      const monday = getNextWeekday(1);
      cy.get(`[data-date="${monday}"]`).click();
      cy.wait("@getSlots");

      // Count slots
      cy.get('[data-testid="time-slot"]').its("length").as("staff1Slots");

      // Go back and select different staff
      cy.contains("Back").click();

      // Staff 2: 10:00-18:00
      cy.get('[data-testid="staff-card"]').eq(1).click();
      cy.contains("Book").click();
      cy.get(`[data-date="${monday}"]`).click();
      cy.wait("@getSlots");

      cy.get('[data-testid="time-slot"]').its("length").as("staff2Slots");

      // Different staff should have different slot counts
      cy.get("@staff1Slots").then((slots1) => {
        cy.get("@staff2Slots").then((slots2) => {
          expect(slots1).to.not.equal(slots2);
        });
      });
    });
  });

  describe("Break Time Handling", () => {
    it("should exclude break times from available slots", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      const monday = getNextWeekday(1);
      cy.get(`[data-date="${monday}"]`).click();
      cy.wait("@getSlots");

      // From fixture: Break 13:00-14:00
      cy.get('[data-testid="time-slot"]').each(($slot) => {
        const time = $slot.attr("data-time");

        // No slot should start during break time
        expect(time).to.not.be.oneOf(["13:00", "13:15", "13:30", "13:45"]);
      });
    });

    it("should not allow booking that would overlap with break", () => {
      // Service duration: 60 minutes
      // If slot at 12:00-13:00 and break starts at 13:00, this should be fine
      // But slot at 12:30 would end at 13:30, overlapping break - should not exist

      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click(); // 60min service
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      const monday = getNextWeekday(1);
      cy.get(`[data-date="${monday}"]`).click();
      cy.wait("@getSlots");

      // 12:30 slot should not exist (would overlap 13:00-14:00 break)
      cy.get('[data-testid="time-slot"][data-time="12:30"]').should(
        "not.exist"
      );
    });
  });

  describe("Existing Bookings Consideration", () => {
    it("should not show slots that are already booked", () => {
      // Create a booking first
      cy.loginAsTenantAdmin(tenantAdmin.email, tenantAdmin.password);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      futureDate.setHours(10, 0, 0, 0);

      cy.createBooking(
        {
          serviceId: "test-service-id",
          beauticianId: "test-staff-id",
          start: futureDate.toISOString(),
          duration: 60,
          customerName: "Test Booking",
          customerEmail: "test@example.com",
          customerPhone: "+447700900000",
        },
        tenant1.slug
      );

      cy.logout();

      // Now try to book the same slot
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      const dateStr = futureDate.toISOString().split("T")[0];
      cy.get(`[data-date="${dateStr}"]`).click();
      cy.wait("@getSlots");

      // 10:00 slot should not be available
      cy.get('[data-testid="time-slot"][data-time="10:00"]').should(
        "not.exist"
      );
    });

    it("should handle overlapping bookings correctly", () => {
      // Booking 1: 10:00-11:00
      // Booking 2 attempt: 10:30-11:30 should fail (overlaps)

      cy.loginAsTenantAdmin(tenantAdmin.email, tenantAdmin.password);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 4);
      futureDate.setHours(10, 0, 0, 0);

      cy.createBooking(
        {
          serviceId: "test-service-id",
          beauticianId: "test-staff-id",
          start: futureDate.toISOString(),
          duration: 60,
        },
        tenant1.slug
      );

      cy.logout();

      // Try to book overlapping slot
      cy.visit(`/salon/${tenant1.slug}`);
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      const dateStr = futureDate.toISOString().split("T")[0];
      cy.get(`[data-date="${dateStr}"]`).click();
      cy.wait("@getSlots");

      // Neither 10:00 nor 10:30 should be available
      cy.get('[data-testid="time-slot"][data-time="10:00"]').should(
        "not.exist"
      );
      cy.get('[data-testid="time-slot"][data-time="10:30"]').should(
        "not.exist"
      );
    });
  });

  describe("Service Duration Consideration", () => {
    it("should calculate slots based on service duration", () => {
      // Short service (45min) should have more slots than long service (90min)

      cy.visit(`/salon/${tenant1.slug}`);

      // Select 45-minute service
      cy.get('[data-testid="service-card"]').contains("45").click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      const monday = getNextWeekday(1);
      cy.get(`[data-date="${monday}"]`).click();
      cy.wait("@getSlots");

      cy.get('[data-testid="time-slot"]').its("length").as("shortServiceSlots");

      // Go back and select 90-minute service
      cy.visit(`/salon/${tenant1.slug}`);
      cy.get('[data-testid="service-card"]').contains("90").click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();
      cy.get(`[data-date="${monday}"]`).click();
      cy.wait("@getSlots");

      cy.get('[data-testid="time-slot"]').its("length").as("longServiceSlots");

      // Short service should have more slots
      cy.get("@shortServiceSlots").then((short) => {
        cy.get("@longServiceSlots").then((long) => {
          expect(short).to.be.greaterThan(long);
        });
      });
    });

    it("should not show slots where service would run past closing time", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      // 60-minute service, closing at 17:00
      cy.get('[data-testid="service-card"]').first().click(); // 60min
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      const monday = getNextWeekday(1);
      cy.get(`[data-date="${monday}"]`).click();
      cy.wait("@getSlots");

      // Last slot should be 16:00 (ends at 17:00)
      cy.get('[data-testid="time-slot"]')
        .last()
        .should("have.attr", "data-time", "16:00");

      // 16:30 should not exist (would end at 17:30, past closing)
      cy.get('[data-testid="time-slot"][data-time="16:30"]').should(
        "not.exist"
      );
    });
  });

  describe("Time Off Handling", () => {
    it("should not show slots when staff has time off", () => {
      // Admin sets time off
      cy.loginAsTenantAdmin(tenantAdmin.email, tenantAdmin.password);

      const timeOffDate = new Date();
      timeOffDate.setDate(timeOffDate.getDate() + 7);

      cy.get("@authToken").then((token) => {
        cy.request({
          method: "POST",
          url: `${Cypress.env(
            "API_URL"
          )}/api/beauticians/test-staff-id/time-off`,
          headers: {
            Authorization: `Bearer ${token}`,
            "x-tenant-slug": tenant1.slug,
          },
          body: {
            start: timeOffDate.toISOString().split("T")[0],
            end: timeOffDate.toISOString().split("T")[0],
            reason: "Vacation",
          },
        });
      });

      cy.logout();

      // Try to book on time-off day
      cy.visit(`/salon/${tenant1.slug}`);
      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      const dateStr = timeOffDate.toISOString().split("T")[0];
      cy.get(`[data-date="${dateStr}"]`).click();
      cy.wait("@getSlots");

      // Should show no slots available
      cy.contains(/no.*available|unavailable/i).should("be.visible");
    });
  });

  describe("Timezone Correctness", () => {
    it("should display times in correct timezone", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      const monday = getNextWeekday(1);
      cy.get(`[data-date="${monday}"]`).click();
      cy.wait("@getSlots");

      // Times should be displayed in Europe/London timezone
      // From fixture: working hours 09:00-17:00
      cy.get('[data-testid="time-slot"]').first().should("contain", "09:00");
    });

    it("should handle daylight saving time correctly", () => {
      // This test would need to mock different dates across DST transition
      // For now, just verify timezone is set correctly

      cy.request({
        url: `${Cypress.env("API_URL")}/api/salon/${tenant1.slug}`,
        headers: {
          "x-tenant-slug": tenant1.slug,
        },
      }).then((response) => {
        expect(response.body.settings.timezone).to.equal("Europe/London");
      });
    });
  });

  describe("No Slots Available Message", () => {
    it("should show helpful message when no slots are available", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      // Mock API to return empty slots
      cy.intercept("GET", "**/api/availability/slots*", {
        statusCode: 200,
        body: { slots: [], message: "No available slots for this date" },
      }).as("getNoSlots");

      const monday = getNextWeekday(1);
      cy.get(`[data-date="${monday}"]`).click();
      cy.wait("@getNoSlots");

      // Should show helpful message
      cy.contains(/no.*available|fully booked|try another date/i).should(
        "be.visible"
      );
    });

    it("should suggest alternative dates when current date is fully booked", () => {
      cy.visit(`/salon/${tenant1.slug}`);

      cy.get('[data-testid="service-card"]').first().click();
      cy.contains("Select").click();
      cy.get('[data-testid="staff-card"]').first().click();
      cy.contains("Book").click();

      // Mock fully booked day
      cy.intercept("GET", "**/api/availability/slots*date=*", (req) => {
        const date = new URL(req.url).searchParams.get("date");
        const today = new Date().toISOString().split("T")[0];

        if (date === today) {
          req.reply({ slots: [] });
        } else {
          req.reply({ slots: [{ time: "10:00", available: true }] });
        }
      }).as("getSlotsConditional");

      const today = new Date().toISOString().split("T")[0];
      cy.get(`[data-date="${today}"]`).click();
      cy.wait("@getSlotsConditional");

      cy.contains(/no.*available|try another date/i).should("be.visible");

      // Try next day
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      cy.get(`[data-date="${tomorrowStr}"]`).click();
      cy.wait("@getSlotsConditional");

      // Should have slots
      cy.get('[data-testid="time-slot"]').should("exist");
    });
  });
});

// Helper function to get next specific weekday
function getNextWeekday(targetDay) {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilTarget = (targetDay + 7 - currentDay) % 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + (daysUntilTarget || 7));
  return nextDate.toISOString().split("T")[0];
}
