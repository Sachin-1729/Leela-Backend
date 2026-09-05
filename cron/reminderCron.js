const cron = require("node-cron");
const { Op } = require("sequelize");

const {
    Reminder,
    Event,
    Category,
    Task,
    Staff,
    ReminderLog,
} = require("../models");

cron.schedule("* * * * *", async () => {
    console.log("Checking reminders...");

    try {
        const now = new Date();
   

        console.log("JS NOW:", now);
        console.log("JS NOW ISO:", now.toISOString());

        const reminders = await Reminder.findAll({
            where: {
                status: "pending",
                schedule: {
                    [Op.lte]: now,
                },
            },
             logging: console.log,
        });

        console.log("FOUND:", reminders.length);

        for (const reminder of reminders) {
            console.log("Processing reminder:", reminder.id);

            await reminder.update({
                status: "processing",
            });

            const event = await Event.findByPk(reminder.eventid, {
                include: [
                    {
                        model: Category,
                        as: "categories",
                        include: [
                            {
                                model: Task,
                                as: "tasks",
                                include: [
                                    {
                                        model: Staff,
                                        as: "staff",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });


            if (!event) {
                console.log("Event not found:", reminder.eventid);

                await reminder.update({
                    status: "completed",
                });

                continue;
            }

            for (const category of event.categories) {
                for (const task of category.tasks) {

                    const staff = task.staff;

                      // Only create reminder for pending tasks
                    if (task?.status !== "pending") {
                        continue;
                    }

                    if (!staff) {
                        continue;
                    }

                    const message = `
                                                    Dear ${staff.name},

                                                    This is a reminder to complete your assigned task for the upcoming event.

                                                    📋 Task: ${task.title}
                                                    🎫 Event: ${event.eventName}
                                                    📅 Date: ${event.date}
                                                    ⏰ Time: ${event.start}

                                                    Once the task is completed, please click the button below to confirm.

                                                    [✅ Done]
                                                    `;

                    console.log("================================");
                    console.log("Reminder ID:", reminder.id);
                    console.log("Staff:", staff.name);
                    console.log("WhatsApp:", staff.whatsappNumber);
                    console.log(message);
                    console.log("================================");

                    await ReminderLog.create({
                        reminderid: reminder.id,
                        taskid: task.id,
                        staffid: staff.id,
                        message,
                        status: "sent",
                        sentat: new Date(),
                    });
                }
            }
            await reminder.update({
                status: "completed",
            });

            console.log("Reminder completed:", reminder.id);
        }
    } catch (error) {
        console.error("Reminder cron error:", error);
    }
});