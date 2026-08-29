   // Message for managers


 function message(name , phone , date)
{
      const message = `
🚨 New Booking Request

A client has reached out.

Name: ${name}
Phone: ${phone}
Date: ${date}

Please reach out to the client soon.
`;

return message

}

module.exports = {
    message
}

