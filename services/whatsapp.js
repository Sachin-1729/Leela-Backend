const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsAppMessage = async (phone, msg) => {
  const message = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${phone}`,
    body: msg,
  });

  console.log(`WhatsApp sent to ${phone}:`, message.sid);

  return message;
};

module.exports = {
  sendWhatsAppMessage,
};