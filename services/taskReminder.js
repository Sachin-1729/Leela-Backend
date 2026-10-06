const Reminder = require("../models/Reminder");
const {
  getEventStartDateTime,
  calculateReminderSchedule,
} = require("./reminderSchedule");

// Schedules a reminder for a real task from its time (DD:HH:mm offset) and
// name (before/after), relative to the event start.
// taskTemplateId is set when the task was created from an Event Template.
async function createTaskReminder(event, task, { transaction, taskTemplateId = null } = {}) {
  const eventStart = getEventStartDateTime(event);

  const schedule = calculateReminderSchedule(eventStart, task.time, task.name);

  return await Reminder.create(
    {
      eventid: event.id,
      taskid: task.id,
      tasktemplateid: taskTemplateId,
      schedule,
    },
    { transaction }
  );
}

module.exports = {
  createTaskReminder,
};
