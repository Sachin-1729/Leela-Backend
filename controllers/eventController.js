const { Op } = require("sequelize");
const Events = require("../models/Events");
const Category = require("../models/Category");
const Task = require("../models/Tasks");
const Staff = require("../models/Staff");
const EventTemplate = require("../models/EventTemplate");
const CategoryTemplate = require("../models/CategoryTemplate");
const TaskTemplate = require("../models/TaskTemplate");
const { createTaskReminder } = require("../services/taskReminder");


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

    const toSeconds = (time) => {
      const [h = 0, m = 0, s = 0] = String(time).split(":").map(Number);
      return h * 3600 + m * 60 + s;
    };

    if (toSeconds(start) >= toSeconds(end)) {
      await transaction.rollback();
      return res.status(400).json({
        error: "End time must be after start time"
      });
    }

    // -------------------------
    // Check slot availability
    // -------------------------

    const conflictingEvent = await findConflictingEvent(date, start, end, transaction);

    if (conflictingEvent) {
      await transaction.rollback();
      return res.status(409).json({
        error: `This slot is already booked by "${conflictingEvent.eventName}" (${conflictingEvent.start} - ${conflictingEvent.end}) on this date`
      });
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

            const task = await Task.create(
              {
                categoryId: category.id,
                title: taskData.title,
                staffId: taskData.staff.id,
                time: taskData.time,
                name: taskData.name
              },
              { transaction }
            );

            // Template tasks without a reminder config get no reminder
            if (taskData.time && taskData.name) {
              await createTaskReminder(event, task, {
                transaction,
                taskTemplateId: taskData.id,
              });
            }
          }
        }
      }
    }

    // -------------------------
    // 5. Commit transaction
    // -------------------------

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


// Returns an event on the same calendar date whose time range overlaps [start, end).
// Back-to-back events (one ends exactly when the other starts) are allowed.
async function findConflictingEvent(date, start, end, transaction) {
  const eventDate = new Date(date);

  if (isNaN(eventDate.getTime())) {
    throw new Error("Invalid date");
  }

  // Event dates are stored as UTC midnight, so match on the UTC calendar day
  const dayStart = new Date(Date.UTC(
    eventDate.getUTCFullYear(),
    eventDate.getUTCMonth(),
    eventDate.getUTCDate()
  ));
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  return await Events.findOne({
    where: {
      date: { [Op.gte]: dayStart, [Op.lt]: dayEnd },
      start: { [Op.lt]: end },
      end: { [Op.gt]: start },
    },
    transaction,
  });
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