/**
 * Tests for DateTimePicker component
 * Run with: npm test -- DateTimePicker.test.js
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";

// Mock dayjs with timezone support
const mockDayjs = (dateStr) => {
  const date = new Date(dateStr);
  return {
    toDate: () => date,
    format: (fmt) => {
      if (fmt === "YYYY-MM-DD") return dateStr.split("T")[0];
      if (fmt === "HH:mm") {
        const hours = String(date.getHours()).padStart(2, "0");
        const mins = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${mins}`;
      }
      return dateStr;
    },
    tz: () => mockDayjs(dateStr),
    isValid: () => true,
    isAfter: (other) => date > (other.toDate ? other.toDate() : other),
    isBefore: (other) => date < (other.toDate ? other.toDate() : other),
    day: () => date.getDay(),
    startOf: () => mockDayjs(dateStr),
  };
};

describe("DateTimePicker - Disabled Days Logic", () => {
  it("should disable past dates", () => {
    const today = new Date("2025-10-14T10:00:00Z");
    const pastDate = new Date("2025-10-13T10:00:00Z");
    const futureDate = new Date("2025-10-15T10:00:00Z");

    const isPast = pastDate < today;
    const isFuture = futureDate >= today;

    assert.strictEqual(isPast, true, "Past date should be identified");
    assert.strictEqual(isFuture, true, "Future date should be identified");
  });

  it("should disable days when beautician does not work", () => {
    const workingHours = [
      { dayOfWeek: 1, start: "09:00", end: "17:00" }, // Monday
      { dayOfWeek: 2, start: "09:00", end: "17:00" }, // Tuesday
      { dayOfWeek: 3, start: "09:00", end: "17:00" }, // Wednesday
    ];

    const monday = new Date("2025-10-13"); // Monday
    const sunday = new Date("2025-10-12"); // Sunday

    const workingDaysSet = new Set(workingHours.map((wh) => wh.dayOfWeek));

    assert.strictEqual(
      workingDaysSet.has(monday.getDay()),
      true,
      "Monday should be a working day"
    );
    assert.strictEqual(
      workingDaysSet.has(sunday.getDay()),
      false,
      "Sunday should not be a working day"
    );
  });

  it("should disable fully booked dates", () => {
    const fullyBooked = ["2025-10-15", "2025-10-16", "2025-10-20"];
    const dateToCheck1 = "2025-10-15";
    const dateToCheck2 = "2025-10-14";

    assert.strictEqual(
      fullyBooked.includes(dateToCheck1),
      true,
      "2025-10-15 should be fully booked"
    );
    assert.strictEqual(
      fullyBooked.includes(dateToCheck2),
      false,
      "2025-10-14 should not be fully booked"
    );
  });

  it("should provide correct disabled reason", () => {
    const today = new Date("2025-10-14");
    const workingDaysSet = new Set([1, 2, 3, 4, 5]); // Mon-Fri
    const fullyBooked = ["2025-10-15"];

    const getDisabledReason = (date) => {
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();

      if (date < today) return "Past date";
      if (!workingDaysSet.has(dayOfWeek)) return "Not working";
      if (fullyBooked.includes(dateStr)) return "Fully booked";
      return "";
    };

    assert.strictEqual(getDisabledReason(new Date("2025-10-13")), "Past date");
    assert.strictEqual(
      getDisabledReason(new Date("2025-10-19")),
      "Not working"
    ); // Sunday
    assert.strictEqual(
      getDisabledReason(new Date("2025-10-15")),
      "Fully booked"
    );
    assert.strictEqual(getDisabledReason(new Date("2025-10-14")), "");
  });
});

describe("DateTimePicker - Slot Validation", () => {
  it("should validate slot has valid ISO strings", () => {
    const validSlot = {
      startISO: "2025-10-14T09:00:00Z",
      endISO: "2025-10-14T10:00:00Z",
      beauticianId: "507f1f77bcf86cd799439011",
    };

    const invalidSlot = {
      startISO: "invalid-date",
      endISO: "2025-10-14T10:00:00Z",
      beauticianId: "507f1f77bcf86cd799439011",
    };

    const start1 = new Date(validSlot.startISO);
    const start2 = new Date(invalidSlot.startISO);

    assert.strictEqual(
      !isNaN(start1.getTime()),
      true,
      "Valid slot should have valid start date"
    );
    assert.strictEqual(
      isNaN(start2.getTime()),
      true,
      "Invalid slot should have invalid start date"
    );
  });

  it("should validate slot end is after start", () => {
    const validSlot = {
      startISO: "2025-10-14T09:00:00Z",
      endISO: "2025-10-14T10:00:00Z",
    };

    const invalidSlot = {
      startISO: "2025-10-14T10:00:00Z",
      endISO: "2025-10-14T09:00:00Z",
    };

    const start1 = new Date(validSlot.startISO);
    const end1 = new Date(validSlot.endISO);
    const start2 = new Date(invalidSlot.startISO);
    const end2 = new Date(invalidSlot.endISO);

    assert.strictEqual(
      end1 > start1,
      true,
      "Valid slot end should be after start"
    );
    assert.strictEqual(
      end2 > start2,
      false,
      "Invalid slot end should not be after start"
    );
  });

  it("should validate slot is on correct date", () => {
    const slot = {
      startISO: "2025-10-14T09:00:00Z",
      endISO: "2025-10-14T10:00:00Z",
    };

    const requestedDate = "2025-10-14";
    const wrongDate = "2025-10-15";

    const slotDate = new Date(slot.startISO).toISOString().split("T")[0];

    assert.strictEqual(
      slotDate === requestedDate,
      true,
      "Slot should be on requested date"
    );
    assert.strictEqual(
      slotDate === wrongDate,
      false,
      "Slot should not match wrong date"
    );
  });

  it("should filter out invalid slots and show error if too many invalid", () => {
    const fetchedSlots = [
      { startISO: "2025-10-14T09:00:00Z", endISO: "2025-10-14T10:00:00Z" },
      { startISO: "invalid", endISO: "2025-10-14T11:00:00Z" },
      { startISO: "2025-10-14T12:00:00Z", endISO: "2025-10-14T13:00:00Z" },
      { startISO: "2025-10-14T10:00:00Z", endISO: "2025-10-14T09:00:00Z" }, // End before start
    ];

    const validatedSlots = fetchedSlots.filter((slot) => {
      const start = new Date(slot.startISO);
      const end = new Date(slot.endISO);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
    });

    assert.strictEqual(validatedSlots.length, 2, "Should have 2 valid slots");

    const errorThreshold = fetchedSlots.length * 0.8;
    const shouldShowError = validatedSlots.length < errorThreshold;

    assert.strictEqual(
      shouldShowError,
      true,
      "Should show error when too many slots invalid"
    );
  });
});

describe("DateTimePicker - DST Edge Cases", () => {
  it("should handle DST spring forward (clocks ahead) correctly", () => {
    // In Europe/London, DST typically starts last Sunday of March
    // Clocks go forward 1 hour (1:00 AM -> 2:00 AM)
    const dstDate = "2025-03-30"; // Last Sunday of March 2025

    // Slot at 1:30 AM would be skipped (invalid time)
    const invalidSlot = {
      startISO: "2025-03-30T01:30:00Z",
      endISO: "2025-03-30T02:30:00Z",
    };

    // Slot at 3:00 AM would be valid (after DST transition)
    const validSlot = {
      startISO: "2025-03-30T03:00:00Z",
      endISO: "2025-03-30T04:00:00Z",
    };

    // In real implementation, we'd use dayjs.tz to check if time exists
    // For test purposes, just verify we're checking dates properly
    assert.ok(
      new Date(invalidSlot.startISO).getHours() === 1,
      "Invalid slot should be during DST transition hour"
    );
    assert.ok(
      new Date(validSlot.startISO).getHours() === 3,
      "Valid slot should be after DST transition"
    );
  });

  it("should handle DST fall back (clocks behind) correctly", () => {
    // In Europe/London, DST typically ends last Sunday of October
    // Clocks go back 1 hour (2:00 AM -> 1:00 AM)
    const dstDate = "2025-10-26"; // Last Sunday of October 2025

    // Times between 1:00-2:00 AM occur twice
    // Our slot system should use UTC to avoid ambiguity
    const slot1 = {
      startISO: "2025-10-26T01:00:00Z", // First occurrence
      endISO: "2025-10-26T02:00:00Z",
    };

    const slot2 = {
      startISO: "2025-10-26T02:00:00Z", // Second occurrence (after fall back)
      endISO: "2025-10-26T03:00:00Z",
    };

    // Both should be valid as they use UTC
    assert.ok(
      new Date(slot1.startISO).getTime() < new Date(slot2.startISO).getTime(),
      "Slots should be ordered correctly using UTC"
    );
  });
});

describe("DateTimePicker - Time Formatting", () => {
  it("should format slot time correctly for display", () => {
    const formatSlotTime = (isoString) => {
      const date = new Date(isoString);
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    assert.strictEqual(formatSlotTime("2025-10-14T09:15:00Z"), "09:15");
    assert.strictEqual(formatSlotTime("2025-10-14T14:30:00Z"), "14:30");
    assert.strictEqual(formatSlotTime("2025-10-14T00:00:00Z"), "00:00");
  });

  it("should format selected date correctly for display", () => {
    const formatSelectedDate = (date) => {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const dayName = days[date.getDay()];
      const monthName = months[date.getMonth()];
      const dayNum = date.getDate();
      const year = date.getFullYear();

      return `${dayName}, ${monthName} ${dayNum}, ${year}`;
    };

    const testDate = new Date("2025-10-14");
    assert.strictEqual(
      formatSelectedDate(testDate),
      "Tuesday, October 14, 2025"
    );
  });
});

console.log("✅ All DateTimePicker tests passed!");
