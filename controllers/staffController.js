const Staff = require("../models/Staff");


async function createStaff(req, res) {

    try {
        const { name, whatsappNumber } = req.body;

        const alreadyExistStaff = await Staff.findAll({
            where:{
                whatsappNumber
            }
        })

        if(alreadyExistStaff.length > 0)
        {
           return res.status(400).json({
            message: "Already Exist"
        });

        }

        const staff = await Staff.create({
            name,
            whatsappNumber
        });

        res.status(201).json(staff);

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
}


const getStaffs = async (req, res) => {
try {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const { count, rows: staffs } = await Staff.findAndCountAll({
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  res.json({
    total: count,
    data: staffs,
    next: staffs.length === limit ? page + 1 : -1,
  });
} catch (error) {
  console.error(error);

  res.status(500).json({
    message: "Failed to fetch leads",
  });
}
};

module.exports = {
    createStaff,
    getStaffs
}