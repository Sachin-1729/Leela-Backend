const { message } = require("../contants/lead");
const Tasks = require("../models/Tasks");
const { Category, Event } = require("../models");
const { validateReminderConfig } = require("../services/reminderSchedule");
const { createTaskReminder } = require("../services/taskReminder");

async function createTasks(req , res)
{
    const {categoryId , title , staffId, time, name} = req.body;

    const reminderError = validateReminderConfig({ time, name });

    if (reminderError)
    {
        return res.status(400).json({
            message: reminderError
        })
    }

    const alreadyExist = await Tasks.findAll({
        where: {
            categoryId,
            title, 
            staffId
        }
    })

    if(alreadyExist.length > 0)
    {
        return res.status(401).json({
            message: "Already exisit"
        })
    }

    const category = await Category.findByPk(categoryId, {
        include: [{ model: Event, as: "event" }]
    })

    if (!category?.event)
    {
        return res.status(404).json({
            message: "Category or event not found"
        })
    }

    if (!category.event.start)
    {
        return res.status(400).json({
            message: "Event has no start time, so the reminder cannot be scheduled"
        })
    }

    const transaction = await Tasks.sequelize.transaction();

    try {
        const tasks = await Tasks.create({
            categoryId,
            title,
            staffId,
            time,
            name
        }, { transaction })

        await createTaskReminder(category.event, tasks, { transaction })

        await transaction.commit();

        return res.status(201).json({
            data: tasks
        })
    } catch (error) {
        await transaction.rollback();

        console.error("Create task error:", error);

        return res.status(500).json({
            message: "Failed to create task"
        })
    }
}



const getTasks = async (req, res) => {
try {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const { count, rows: tasks } = await Tasks.findAndCountAll({
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  res.json({
    total: count,
    data: tasks,
    next: tasks.length === limit ? page + 1 : -1,
  });
} catch (error) {
  console.error(error);

  res.status(500).json({
    message: "Failed to fetch tasks",
  });
}
};

module.exports = {
    createTasks,
    getTasks
}