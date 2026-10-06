const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  isValidReminderTime,
  isValidReminderType,
  validateReminderConfig,
  getEventStartDateTime,
  calculateReminderSchedule,
} = require("../services/reminderSchedule");

// Event start times are IST (+05:30)
const ist = (dateTime) => new Date(`${dateTime}+05:30`);

describe("isValidReminderTime", () => {
  it("accepts HH:mm values", () => {
    for (const time of ["00:00", "00:45", "01:30", "09:30", "14:45", "23:59"]) {
      assert.equal(isValidReminderTime(time), true, time);
    }
  });

  it("rejects anything else", () => {
    const invalid = [
      "", "1:30", "01:3", "24:00", "12:60", "01:30:00", "1h", "abc",
      " 01:30", "01:30 ", "01-30", null, undefined, 90,
    ];

    for (const time of invalid) {
      assert.equal(isValidReminderTime(time), false, String(time));
    }
  });
});

describe("isValidReminderType", () => {
  it("accepts only before and after", () => {
    assert.equal(isValidReminderType("before"), true);
    assert.equal(isValidReminderType("after"), true);
    assert.equal(isValidReminderType("during"), false);
    assert.equal(isValidReminderType("Before"), false);
    assert.equal(isValidReminderType(""), false);
    assert.equal(isValidReminderType(undefined), false);
  });
});

describe("validateReminderConfig", () => {
  it("returns null for a valid config", () => {
    assert.equal(validateReminderConfig({ time: "01:30", name: "before" }), null);
  });

  it("requires time", () => {
    assert.match(validateReminderConfig({ name: "before" }), /Time is required/);
  });

  it("rejects malformed time", () => {
    assert.match(
      validateReminderConfig({ time: "1 hour", name: "before" }),
      /HH:mm/
    );
  });

  it("requires before/after", () => {
    assert.match(
      validateReminderConfig({ time: "01:30" }),
      /Before\/After is required/
    );
  });

  it("rejects unsupported before/after values", () => {
    assert.match(
      validateReminderConfig({ time: "01:30", name: "during" }),
      /must be one of/
    );
  });
});

describe("getEventStartDateTime", () => {
  it("combines the event date with its IST start time", () => {
    const start = getEventStartDateTime({ date: "2026-10-10", start: "15:00:00" });
    assert.equal(start.toISOString(), ist("2026-10-10T15:00:00").toISOString());
  });

  it("accepts a Date stored as UTC midnight", () => {
    const start = getEventStartDateTime({
      date: new Date("2026-10-10T00:00:00Z"),
      start: "15:00",
    });
    assert.equal(start.toISOString(), ist("2026-10-10T15:00:00").toISOString());
  });

  it("throws without a start time", () => {
    assert.throws(() => getEventStartDateTime({ date: "2026-10-10" }));
  });
});

describe("calculateReminderSchedule", () => {
  const eventStart = ist("2026-10-10T15:00:00");

  it("subtracts the offset for before", () => {
    assert.equal(
      calculateReminderSchedule(eventStart, "01:30", "before").toISOString(),
      ist("2026-10-10T13:30:00").toISOString()
    );
  });

  it("adds the offset for after", () => {
    assert.equal(
      calculateReminderSchedule(eventStart, "02:00", "after").toISOString(),
      ist("2026-10-10T17:00:00").toISOString()
    );
  });

  it("schedules at the start time for a zero offset", () => {
    assert.equal(
      calculateReminderSchedule(eventStart, "00:00", "before").toISOString(),
      eventStart.toISOString()
    );
  });

  it("rolls back to the previous day when crossing midnight", () => {
    const start = ist("2026-10-10T00:30:00");
    assert.equal(
      calculateReminderSchedule(start, "02:00", "before").toISOString(),
      ist("2026-10-09T22:30:00").toISOString()
    );
  });

  it("rolls forward to the next day when crossing midnight", () => {
    const start = ist("2026-10-10T23:00:00");
    assert.equal(
      calculateReminderSchedule(start, "01:15", "after").toISOString(),
      ist("2026-10-11T00:15:00").toISOString()
    );
  });

  it("crosses month and year boundaries", () => {
    const start = ist("2027-01-01T00:30:00");
    assert.equal(
      calculateReminderSchedule(start, "01:00", "before").toISOString(),
      ist("2026-12-31T23:30:00").toISOString()
    );
  });

  it("rejects invalid configs", () => {
    assert.throws(() => calculateReminderSchedule(eventStart, "1:30", "before"));
    assert.throws(() => calculateReminderSchedule(eventStart, "01:30", "during"));
  });
});
