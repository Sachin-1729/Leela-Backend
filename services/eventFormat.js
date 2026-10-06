// Human-readable event date/time for messages, e.g. "Wed Oct 7" and "05:35 PM".

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Event dates are stored as UTC midnight, so read the UTC calendar day.
function formatEventDate(date) {
  const eventDate = new Date(date);

  if (isNaN(eventDate.getTime())) {
    return "";
  }

  const weekday = WEEKDAYS[eventDate.getUTCDay()];
  const month = MONTHS[eventDate.getUTCMonth()];

  return `${weekday} ${month} ${eventDate.getUTCDate()}`;
}

// "17:35:00" -> "05:35 PM"
function formatEventTime(time) {
  const match = String(time ?? "").match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return "";
  }

  const hours = Number(match[1]);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;

  return `${String(hours12).padStart(2, "0")}:${match[2]} ${period}`;
}

module.exports = {
  formatEventDate,
  formatEventTime,
};
