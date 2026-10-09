// Meta rejects empty template params
const EMPTY_PARAM = "-";

// Assumed country code for numbers uploaded without one
const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || "91";

// Meta rejects params with newlines, tabs or 4+ consecutive spaces
function toTemplateParam(value) {
  const text = String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ {4,}/g, "   ")
    .trim();

  return text || EMPTY_PARAM;
}

// Meta expects digits with country code, no "+"
function toWhatsAppNumber(phone) {
  const raw = String(phone ?? "").trim();
  const digits = raw.replace(/\D/g, "");

  if (!raw.startsWith("+") && digits.length === 10) {
    return `${DEFAULT_COUNTRY_CODE}${digits}`;
  }

  return digits;
}

module.exports = {
  toTemplateParam,
  toWhatsAppNumber,
};
