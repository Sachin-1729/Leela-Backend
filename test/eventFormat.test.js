const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { formatEventDate, formatEventTime } = require("../services/eventFormat");

describe("formatEventDate", () => {
  it("formats as weekday, month and day", () => {
    assert.equal(formatEventDate("2026-10-07"), "Wed Oct 7");
    assert.equal(formatEventDate(new Date("2026-10-10T00:00:00Z")), "Sat Oct 10");
  });

  it("uses the stored UTC calendar day", () => {
    assert.equal(formatEventDate("2026-12-31T00:00:00.000Z"), "Thu Dec 31");
  });

  it("returns an empty string for invalid dates", () => {
    assert.equal(formatEventDate("not a date"), "");
    assert.equal(formatEventDate(undefined), "");
  });
});

describe("formatEventTime", () => {
  it("formats morning times as AM", () => {
    assert.equal(formatEventTime("05:35:00"), "05:35 AM");
    assert.equal(formatEventTime("09:05"), "09:05 AM");
  });

  it("formats afternoon times as PM", () => {
    assert.equal(formatEventTime("17:35:00"), "05:35 PM");
    assert.equal(formatEventTime("23:59:00"), "11:59 PM");
  });

  it("handles midnight and noon", () => {
    assert.equal(formatEventTime("00:00:00"), "12:00 AM");
    assert.equal(formatEventTime("12:00:00"), "12:00 PM");
  });

  it("returns an empty string for missing or invalid times", () => {
    assert.equal(formatEventTime(null), "");
    assert.equal(formatEventTime("abc"), "");
  });
});
