const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsAppMessage = async (manager , name , phone , date) => {
    console.log(manager , phone , name , date)
  const message = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${manager}`,
    contentSid: process.env.TWILIO_BOOKING_TEMPLATE_SID,

    contentVariables: JSON.stringify({
      1: name,
      2: phone,
      3: date,
    }),
  });

  console.log(`WhatsApp sent to ${phone}:`, message.sid);

  return message;
};

module.exports = {
  sendWhatsAppMessage,
};