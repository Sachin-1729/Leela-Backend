const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { toTemplateParam, toWhatsAppNumber } = require("../services/guestInvitationFormat");

describe("toTemplateParam", () => {
  it("replaces empty values with a dash", () => {
    assert.equal(toTemplateParam(""), "-");
    assert.equal(toTemplateParam(null), "-");
    assert.equal(toTemplateParam("   "), "-");
  });

  it("removes newlines and long runs of spaces", () => {
    assert.equal(toTemplateParam("Gate 2\nParking B"), "Gate 2 Parking B");
    assert.equal(toTemplateParam("a      b"), "a   b");
  });
});

describe("toWhatsAppNumber", () => {
  it("adds the default country code to 10 digit numbers", () => {
    assert.equal(toWhatsAppNumber("98765 43210"), "919876543210");
  });

  it("keeps numbers that already have a country code", () => {
    assert.equal(toWhatsAppNumber("+1 415-555-0100"), "14155550100");
    assert.equal(toWhatsAppNumber("919876543210"), "919876543210");
  });
});
