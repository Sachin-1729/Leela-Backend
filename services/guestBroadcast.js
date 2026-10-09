const GuestBroadcast = require("../models/GuestBroadcast");
const GuestInvitation = require("../models/GuestInvitation");
const { sendGuestInvitation } = require("./whatsapp_meta");
const { toTemplateParam, toWhatsAppNumber } = require("./guestInvitationFormat");

// Parallel sends per broadcast (Meta allows ~80 msg/s per number)
const CONCURRENCY = 5;

function metaError(error) {
  return (
    error.response?.data?.error?.error_data?.details ||
    error.response?.data?.error?.message ||
    error.message ||
    "Unknown error"
  );
}

async function sendOne(invitation, { onBehalfOf, message, link }) {
  try {
    const result = await sendGuestInvitation(
      toWhatsAppNumber(invitation.phone),
      toTemplateParam(invitation.guestName),
      toTemplateParam(onBehalfOf),
      toTemplateParam(message),
      toTemplateParam(link)
    );

    await invitation.update({
      status: "success",
      msgid: result?.messages?.[0]?.id || null,
      error: null,
      sentAt: new Date(),
    });
  } catch (error) {
    console.error(
      `Guest invitation ${invitation.id} failed:`,
      JSON.stringify(error.response?.data || error.message)
    );

    await invitation.update({
      status: "failed",
      error: metaError(error),
      sentAt: new Date(),
    });
  }
}

// Sends every pending invitation of a broadcast, then marks it completed.
// Runs in the background, so it must never throw.
async function runBroadcast(broadcastId, onBehalfOf) {
  try {
    const broadcast = await GuestBroadcast.findByPk(broadcastId);

    const invitations = await GuestInvitation.findAll({
      where: { broadcastId, status: "pending" },
      order: [["id", "ASC"]],
    });

    const content = {
      onBehalfOf,
      message: broadcast.message,
      link: broadcast.link,
    };

    let next = 0;

    const worker = async () => {
      while (next < invitations.length) {
        const invitation = invitations[next++];
        await sendOne(invitation, content);
      }
    };

    await Promise.all(
      Array.from({ length: CONCURRENCY }, worker)
    );

    await broadcast.update({ status: "completed" });
  } catch (error) {
    console.error(`Guest broadcast ${broadcastId} crashed:`, error);

    await GuestInvitation.update(
      { status: "failed", error: "Broadcast stopped unexpectedly" },
      { where: { broadcastId, status: "pending" } }
    ).catch(() => {});

    await GuestBroadcast.update(
      { status: "completed" },
      { where: { id: broadcastId } }
    ).catch(() => {});
  }
}

module.exports = {
  runBroadcast,
};
