const CommunityRequest = require("../models/CommunityRequest");
const { COMMUNITIES } = require("../contants/community");
const { sendCommunityJoinToManager } = require("../services/whatsapp_meta");

const getCommunityRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows: requests } = await CommunityRequest.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      total: count,
      data: requests,
      next: requests.length === limit ? page + 1 : -1,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch community requests",
    });
  }
};

const createCommunityRequest = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").replace(/\D/g, "");
    const community = String(req.body.community || "").trim();
    const city = String(req.body.city || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    if (!COMMUNITIES.includes(community)) {
      return res.status(400).json({ message: "Invalid community" });
    }

    const request = await CommunityRequest.create({
      name,
      phone,
      community,
      city: city || null,
    });

    const managers = [
      process.env.MOB_ONE,
      process.env.MOB_TWO,
    ].filter(Boolean);

    for (const manager of managers) {
      try {
        await sendCommunityJoinToManager(manager, name, community, phone);
      } catch (error) {
        console.error(
          `Failed to send community join WhatsApp to ${manager}:`,
          JSON.stringify(
            error.response?.data || error.message,
            null,
            2
          )
        );
      }
    }

    res.status(201).json(request);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create community request",
    });
  }
};

module.exports = {
  getCommunityRequests,
  createCommunityRequest,
};
