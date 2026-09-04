const Events = require("../models/Events");
const Category = require("../models/Category");
const Task = require("../models/Tasks");
const Staff = require("../models/Staff");
const EventTemplate = require("../models/EventTemplate");
const CategoryTemplate = require("../models/CategoryTemplate");
const TaskTemplate = require("../models/TaskTemplate");
const Reminder = require("../models/Reminder");


async function createEvent(req, res) {
  const {
    date,
    owner_name,
    whatsapp_number,
    eventName,
    eventTemplateId,
    start,
    end
  } = req.body;

  const transaction = await Events.sequelize.transaction();

  try {
    // -------------------------
    // 1. Validate request
    // -------------------------

    if (!date) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Date is required"
      });
    }

    if (!owner_name) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Owner name is required"
      });
    }

    if (!whatsapp_number) {
      await transaction.rollback();
      return res.status(400).json({
        error: "WhatsApp number is required"
      });
    }

    if (!eventName) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Event name is required"
      });
    }

    if(!start)
    {
        await transaction.rollback();
      return res.status(400).json({
        error: "Start time is required"
      });

    }

    if(!end)
    {
      await transaction.rollback();
      return res.status(400).json({
        error: "End time is required"
      })
    }

    // -------------------------
    // 2. Get template first
    // -------------------------

    let template = null;

    if (eventTemplateId) {
      template = await getEventTemplateDetail(eventTemplateId);

      if (!template) {
        await transaction.rollback();

        return res.status(404).json({
          error: "Event template not found"
        });
      }
    }

    // -------------------------
    // 3. Create Event
    // -------------------------

    const event = await Events.create(
      {
        date,
        ownerName: owner_name,
        whatsappNumber: whatsapp_number,
        eventName,
        start,
        end
      },
      { transaction }
    );

    // -------------------------
    // 4. Create categories/tasks
    // -------------------------

    if (template?.categories?.length) {

      for (const categoryData of template.categories) {

        if (!categoryData.name) {
          throw new Error("Category name is missing in template");
        }

        const category = await Category.create(
          {
            eventId: event.id,
            name: categoryData.name
          },
          { transaction }
        );

        // -------------------------
        // Create tasks
        // -------------------------

        if (categoryData.tasks?.length) {

          for (const taskData of categoryData.tasks) {

            if (!taskData.title) {
              throw new Error(
                `Task title is missing in category "${categoryData.name}"`
              );
            }

            if (!taskData.staff?.id) {
              throw new Error(
                `Staff is missing for task "${taskData.title}"`
              );
            }

            await Task.create(
              {
                categoryId: category.id,
                title: taskData.title,
                staffId: taskData.staff.id
              },
              { transaction }
            );
          }
        }
      }
    }

    // -------------------------
    // 5. Commit transaction
    // -------------------------

    await createReminder(event, "before", 1, transaction);
    await createReminder(event, "before", 2, transaction);
    await createReminder(event, "before", 0.5, transaction);

    await createReminder(event, "during", null, transaction);

    await createReminder(event, "after", 1, transaction);

    await transaction.commit();

    return res.status(201).json({
      message: "Event created successfully",
      event
    });

  } catch (error) {

    // -------------------------
    // Rollback everything
    // -------------------------

    await transaction.rollback();

    console.error("Create event error:", error);

    return res.status(500).json({
      error: "Failed to create event",
      message: error.message
    });
  }
}


async function createReminder(event, type, value, transaction) {
  const eventDate = new Date(event.date);

  // Get the calendar date from the event date
  // The event date is stored as UTC midnight in the DB.
  const year = eventDate.getUTCFullYear();
  const month = String(eventDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(eventDate.getUTCDate()).padStart(2, "0");

  const dateString = `${year}-${month}-${day}`;

  const [startHour, startMinute, startSecond = 0] = event.start
    .split(":")
    .map(Number);

  const [endHour, endMinute, endSecond = 0] = event.end
    .split(":")
    .map(Number);

  // Explicitly treat event start/end as IST (+05:30)
  const startTime = new Date(
    `${dateString}T${String(startHour).padStart(2, "0")}:${String(
      startMinute
    ).padStart(2, "0")}:${String(startSecond).padStart(2, "0")}+05:30`
  );

  const endTime = new Date(
    `${dateString}T${String(endHour).padStart(2, "0")}:${String(
      endMinute
    ).padStart(2, "0")}:${String(endSecond).padStart(2, "0")}+05:30`
  );

  let schedule;

  if (type === "before") {
    schedule = new Date(startTime);
    schedule.setMinutes(schedule.getMinutes() - value * 60);
  }

  else if (type === "after") {
    schedule = new Date(endTime);
    schedule.setMinutes(schedule.getMinutes() + value * 60);
  }

  else if (type === "during") {
    const duration = endTime.getTime() - startTime.getTime();

    schedule = new Date(
      startTime.getTime() + duration / 2
    );
  }

  else {
    throw new Error("Invalid reminder type");
  }

  console.log("Reminder schedule:");
  console.log("Event date:", dateString);
  console.log("Start IST:", startTime);
  console.log("End IST:", endTime);
  console.log("Schedule UTC:", schedule.toISOString());

  return await Reminder.create(
    {
      eventid: event.id,
      schedule,
    },
    { transaction }
  );
}


async function getEvents(req , res)
{ 
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
  
      const { count, rows: events } = await Events.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  
      res.json({
      total: count,
      data: events,
      next: events.length === limit ? page + 1 : -1,
    });
      } catch (error) {
        console.log(error)
      }

}


async function getEventById(req, res) {
  try {
    const { id } = req.params;

    const event = await Events.findByPk(id, {
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
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
}



async function getEventTemplateDetail(id)
{
    const template = await EventTemplate.findByPk(id, {
      include: [
        {
          model: CategoryTemplate,
          as: "categories",

          include: [
            {
              model: TaskTemplate,
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

  if (!template) {
      return false;
    }

    return template;


}





module.exports = {
    createEvent,
    getEvents,
    getEventById
}