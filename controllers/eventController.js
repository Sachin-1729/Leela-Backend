const Events = require("../models/Events")


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



module.exports = {
    createEvent,
    getEvents
}