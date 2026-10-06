const Events = require("../models/Events");
const EventGuest = require("../models/EventGuest");

const MAX_GUESTS = 5000;

// Keep a leading "+" for country codes, drop spaces/dashes/brackets
function normalizePhone(phone) {
  const raw = String(phone ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  return raw.startsWith("+") ? `+${digits}` : digits;
}

async function getEventGuests(req, res) {
  try {
    const { id } = req.params;

    const event = await Events.findByPk(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const guests = await EventGuest.findAll({
      where: { eventId: id },
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: guests,
    });
  } catch (error) {
    console.error("Error fetching event guests:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch guests",
      error: error.message,
    });
  }
}


// Replaces the whole guest list of an event with the uploaded one
async function replaceEventGuests(req, res) {
  const { id } = req.params;
  const { guests } = req.body;

  if (!Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Guest list is empty",
    });
  }

  if (guests.length > MAX_GUESTS) {
    return res.status(400).json({
      success: false,
      message: `A maximum of ${MAX_GUESTS} guests can be uploaded at once`,
    });
  }

  // Validate rows and drop duplicate phone numbers (first one wins)
  const rows = [];
  const seenPhones = new Set();

  for (const [index, guest] of guests.entries()) {
    const name = String(guest?.name ?? "").trim();
    const phone = normalizePhone(guest?.phone);

    if (!name || phone.replace("+", "").length < 7) {
      return res.status(400).json({
        success: false,
        message: `Invalid guest at row ${index + 1}: name and a valid mobile number are required`,
      });
    }

    if (seenPhones.has(phone)) {
      continue;
    }

    seenPhones.add(phone);
    rows.push({ eventId: Number(id), name, phone });
  }

  const transaction = await EventGuest.sequelize.transaction();

  try {
    const event = await Events.findByPk(id, { transaction });

    if (!event) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await EventGuest.destroy({
      where: { eventId: id },
      transaction,
    });

    const created = await EventGuest.bulkCreate(rows, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Guest list updated successfully",
      skippedDuplicates: guests.length - rows.length,
      data: created,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Error replacing event guests:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update guests",
      error: error.message,
    });
  }
}

module.exports = {
  getEventGuests,
  replaceEventGuests,
};
