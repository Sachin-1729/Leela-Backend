// Reminder scheduling driven by Event Template Task configuration.
// A task template stores an offset (`time`, HH:mm) and a direction (`name`,
// "before" | "after") relative to the real event's start time.

const REMINDER_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const REMINDER_TYPES = ["before", "after"];

// Event start times are entered in IST.
const EVENT_TIMEZONE_OFFSET = "+05:30";

function isValidReminderTime(time) {
  return typeof time === "string" && REMINDER_TIME_REGEX.test(time);
}

function isValidReminderType(name) {
  return REMINDER_TYPES.includes(name);
}

// Returns an error message, or null when the pair is valid.
function validateReminderConfig({ time, name }) {
  if (time === undefined || time === null || time === "") {
    return "Time is required";
  }

  if (!isValidReminderTime(time)) {
    return "Time must be in HH:mm format (e.g. 01:30)";
  }

  if (name === undefined || name === null || name === "") {
    return "Before/After is required";
  }

  if (!isValidReminderType(name)) {
    return `Before/After must be one of: ${REMINDER_TYPES.join(", ")}`;
  }

  return null;
}

function reminderTimeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Combines the event's calendar date (stored as UTC midnight) with its
// start time, interpreted in IST.
function getEventStartDateTime(event) {
  const eventDate = new Date(event.date);

  if (isNaN(eventDate.getTime())) {
    throw new Error("Invalid event date");
  }

  if (!event.start) {
    throw new Error("Event start time is required");
  }

  const year = eventDate.getUTCFullYear();
  const month = String(eventDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(eventDate.getUTCDate()).padStart(2, "0");

  const [hour = 0, minute = 0, second = 0] = String(event.start)
    .split(":")
    .map(Number);

  const startTime = new Date(
    `${year}-${month}-${day}T${String(hour).padStart(2, "0")}:${String(
      minute
    ).padStart(2, "0")}:${String(second).padStart(2, "0")}${EVENT_TIMEZONE_OFFSET}`
  );

  if (isNaN(startTime.getTime())) {
    throw new Error("Invalid event start time");
  }

  return startTime;
}

// before: start - time, after: start + time.
// Works on absolute milliseconds, so crossing midnight rolls the date correctly.
function calculateReminderSchedule(eventStart, time, name) {
  const error = validateReminderConfig({ time, name });

  if (error) {
    throw new Error(error);
  }

  const offsetMs = reminderTimeToMinutes(time) * 60 * 1000;
  const direction = name === "before" ? -1 : 1;

  return new Date(eventStart.getTime() + direction * offsetMs);
}

module.exports = {
  REMINDER_TIME_REGEX,
  REMINDER_TYPES,
  isValidReminderTime,
  isValidReminderType,
  validateReminderConfig,
  getEventStartDateTime,
  calculateReminderSchedule,
};
