const Lead = require("../models/Lead");
const {sendWhatsAppMessage} = require("../services/whatsapp")
const {message} = require("../contants/lead")

const getLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll();

    res.json(leads);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch leads",
    });
  }
};

const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lead",
    });
  }
};

const createLead = async (req, res) => {
  try {
    const { name, phone, date } = req.body;

    const lead = await Lead.create({
      name,
      phone,
      date
    });

    const msg = message(name , phone , date);


  const managers = [
    process.env.MOB_ONE,
    process.env.MOB_TWO,
  ].filter(Boolean);

for (const manager of managers) {
  try {
    await sendWhatsAppMessage(manager, msg);
  } catch (error) {
    console.error(
      `Failed to send WhatsApp to ${manager}:`,
      error.message
    );
  }
}

    res.status(201).json(lead);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create lead",
    });
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    await lead.destroy();

    res.json({
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete lead",
    });
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  deleteLead,
};