const Events = require("../models/Events");
const Category = require("../models/Category");
const Task = require("../models/Tasks");
const Staff = require("../models/Staff");


async function createEvent(req , res)
{
    const {date , owner_name , whatsapp_number , eventName} = req.body;


    const event = Events.create({
        date,
        ownerName: owner_name,
        whatsappNumber: whatsapp_number,
        eventName

    })

    return res.status(201).json(event)

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



module.exports = {
    createEvent,
    getEvents,
    getEventById
}