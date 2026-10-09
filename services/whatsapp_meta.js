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
            // Array -> positional params ({{1}}, {{2}}...)
            // Object -> named params ({{client_name}}...)
            parameters: Array.isArray(parameters)
              ? parameters.map((value) => ({
                  type: "text",
                  text: String(value),
                }))
              : Object.entries(parameters).map(([key, value]) => ({
                  type: "text",
                  parameter_name: key,
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


// New lead -> manager
const sendLeadToManager = async (
  manager,
  name,
  phone,
  date
) => {
  return sendTemplateMessage({
    to: manager,
    templateName: "lead_manager",
    parameters: [name, phone, date],
  });
};


// New lead -> client
const sendLeadToClient = async (
  client,
  name,
  date,
  event
) => {
  return sendTemplateMessage({
    to: client,
    templateName: "client_lead",
    parameters: {
      client_name: name,
      event_date: date,
      event: event
    },
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
  event,
  date,
  time
) => {
  return sendTemplateMessage({
    to: staff,
    templateName: "staff_message",
    parameters: [
      name,
      task,
      event,
      date,
      time,
    ],
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


// Guest invitation (guest_invitation template)
// {{1}} guest name, {{2}} on behalf of (client), {{3}} message, {{4}} link
const sendGuestInvitation = async (
  guest,
  name,
  onBehalfOf,
  message,
  link
) => {
  return sendTemplateMessage({
    to: guest,
    templateName:"guest_message",
    language:  "en",
    parameters: [name, onBehalfOf, message, link],
  });
};


// Community join request -> manager (community_join template)
// {{1}} name, {{2}} community, {{3}} mobile
const sendCommunityJoinToManager = async (
  manager,
  name,
  community,
  phone
) => {
  return sendTemplateMessage({
    to: manager,
    templateName: "community_join",
    language: "en",
    parameters: [name, community, phone],
  });
};


module.exports = {
  sendTemplateMessage,
  sendCommunityJoinToManager,
  sendBookingRequest,
  sendLeadToManager,
  sendLeadToClient,
  sendBookingConfirmation,
  sendTaskAssigned,
  sendTaskReminder,
  sendGuestInvitation,
};