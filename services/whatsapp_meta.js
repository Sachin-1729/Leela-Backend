const axios = require("axios");

const sendTemplateMessage = async ({
  to,
  templateName,
  language = "en",
  parameters = [],
}) => {
  const url =
    `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}/` +
    `${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const response = await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "template",

      template: {
        name: templateName,

        language: {
          code: language,
        },

        components: [
          {
            type: "body",
            parameters: parameters.map((value) => ({
              type: "text",
              text: String(value),
            })),
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};


// Booking request
const sendBookingRequest = async (
  manager,
  name,
  phone,
  date
) => {
  return sendTemplateMessage({
    to: manager,
    templateName: "new_booking_request",
    parameters: [name, phone, date],
  });
};


// Booking confirmation
const sendBookingConfirmation = async (
  customer,
  name,
  service,
  date
) => {
  return sendTemplateMessage({
    to: customer,
    templateName: "booking_confirmation",
    parameters: [name, service, date],
  });
};


// Task assigned
const sendTaskAssigned = async (
  staff,
  name,
  task,
  deadline
) => {
  return sendTemplateMessage({
    to: staff,
    templateName: "task_assigned",
    parameters: [name, task, deadline],
  });
};


// Task reminder
const sendTaskReminder = async (
  staff,
  name,
  task,
  minutes,
  deadline
) => {
  return sendTemplateMessage({
    to: staff,
    templateName: "task_reminder",
    parameters: [
      name,
      task,
      minutes,
      deadline,
    ],
  });
};


module.exports = {
  sendTemplateMessage,
  sendBookingRequest,
  sendBookingConfirmation,
  sendTaskAssigned,
  sendTaskReminder,
};