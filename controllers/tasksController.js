const { message } = require("../contants/lead");
const Tasks = require("../models/Tasks");

async function createTasks(req , res)
{
    const {categoryId , title , staffId} = req.body;

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

    const tasks = await Tasks.create({
        categoryId,
        title,
        staffId
    })

    return res.status(201).json({
        data: tasks
    })
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