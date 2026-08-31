const Category = require("../models/Category");

async function createCategory(req, res) {
  try {
    const { eventId, name } = req.body;

    const alreadyExist = await Category.findAll({
        where: {
            eventId,
            name
        }
    })

    if(alreadyExist.length > 0)
    {
    return res.status(400).json({
            message: "Already Exist"
        });

    }

    const category = await Category.create({
      eventId,
      name,
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
}

const getCategory = async (req, res) => {
try {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const { count, rows: categories } = await Category.findAndCountAll({
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  res.json({
    total: count,
    data: categories,
    next: categories.length === limit ? page + 1 : -1,
  });
} catch (error) {
  console.error(error);

  res.status(500).json({
    message: "Failed to fetch leads",
  });
}
};


const getAllcategory = async (req , res) =>{
    const category = await Category.findAll();
    return res.json({
        data:category
    })
}



module.exports = {
  createCategory,
  getCategory,
  getAllcategory
};