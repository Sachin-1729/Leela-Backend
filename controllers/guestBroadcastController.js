const { fn, col } = require("sequelize");

const Events = require("../models/Events");
const EventGuest = require("../models/EventGuest");
const GuestBroadcast = require("../models/GuestBroadcast");
const GuestInvitation = require("../models/GuestInvitation");
const { runBroadcast } = require("../services/guestBroadcast");

// WhatsApp template body is capped at 1024 chars in total
const MAX_MESSAGE_LENGTH = 700;
const MAX_LINK_LENGTH = 500;

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// { [broadcastId]: { total, success, failed, pending } }
async function getBroadcastCounts(broadcastIds) {
  const counts = {};

  if (broadcastIds.length === 0) {
    return counts;
  }

  const rows = await GuestInvitation.findAll({
    attributes: ["broadcastId", "status", [fn("COUNT", col("id")), "count"]],
    where: { broadcastId: broadcastIds },
    group: ["broadcastId", "status"],
    raw: true,
  });

  for (const row of rows) {
    const entry = (counts[row.broadcastId] ??= {
      total: 0,
      success: 0,
      failed: 0,
      pending: 0,
    });

    const count = Number(row.count);
    entry.total += count;
    entry[row.status] = (entry[row.status] || 0) + count;
  }

  return counts;
}

async function getEventBroadcasts(req, res) {
  try {
    const { id } = req.params;

    const event = await Events.findByPk(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const broadcasts = await GuestBroadcast.findAll({
      where: { eventId: id },
      order: [["createdAt", "DESC"]],
    });

    const counts = await getBroadcastCounts(broadcasts.map((b) => b.id));

    return res.status(200).json({
      success: true,
      data: broadcasts.map((broadcast) => ({
        ...broadcast.toJSON(),
        counts: counts[broadcast.id] || {
          total: 0,
          success: 0,
          failed: 0,
          pending: 0,
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching guest broadcasts:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch broadcasts",
      error: error.message,
    });
  }
}

async function getBroadcastInvitations(req, res) {
  try {
    const { id, broadcastId } = req.params;

    const broadcast = await GuestBroadcast.findOne({
      where: { id: broadcastId, eventId: id },
    });

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast not found",
      });
    }

    const invitations = await GuestInvitation.findAll({
      where: { broadcastId },
      order: [["guestName", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    console.error("Error fetching guest invitations:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invitations",
      error: error.message,
    });
  }
}

// Creates one invitation per guest, responds right away and sends
// the WhatsApp messages in the background (the UI polls for status)
async function createBroadcast(req, res) {
  const { id } = req.params;

  const message = String(req.body?.message ?? "").trim();
  const link = String(req.body?.link ?? "").trim();

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message can be at most ${MAX_MESSAGE_LENGTH} characters`,
    });
  }

  if (link && (link.length > MAX_LINK_LENGTH || !isHttpUrl(link))) {
    return res.status(400).json({
      success: false,
      message: "Link must be a valid http(s) URL",
    });
  }

  const transaction = await GuestBroadcast.sequelize.transaction();

  let broadcast;
  let event;

  try {
    // Row lock so two clicks can't start two broadcasts at once
    event = await Events.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!event) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const running = await GuestBroadcast.findOne({
      where: { eventId: id, status: "sending" },
      transaction,
    });

    if (running) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: "A broadcast is already being sent for this event",
      });
    }

    const guests = await EventGuest.findAll({
      where: { eventId: id },
      transaction,
    });

    if (guests.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "This event has no guests to broadcast to",
      });
    }

    broadcast = await GuestBroadcast.create(
      {
        eventId: Number(id),
        message: message || null,
        link: link || null,
        status: "sending",
      },
      { transaction }
    );

    await GuestInvitation.bulkCreate(
      guests.map((guest) => ({
        broadcastId: broadcast.id,
        eventId: Number(id),
        guestName: guest.name,
        phone: guest.phone,
        status: "pending",
      })),
      { transaction }
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    console.error("Error creating guest broadcast:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start broadcast",
      error: error.message,
    });
  }

  // Fire and forget, runBroadcast handles its own errors
  runBroadcast(broadcast.id, event.ownerName);

  return res.status(202).json({
    success: true,
    message: "Broadcast started",
    data: broadcast,
  });
}

module.exports = {
  getEventBroadcasts,
  getBroadcastInvitations,
  createBroadcast,
};
