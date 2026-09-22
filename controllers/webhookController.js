const ReminderLog = require("../models/ReminderLog");

async function webhook(req, res) {

    console.log("🔥 WEBHOOK HIT");
    console.log("Method:", req.method);
    console.log("Query:", req.query);
    console.log("Body:", req.body);

    // --------------------------------
    // META WEBHOOK VERIFICATION
    // --------------------------------
    if (req.method === "GET") {

        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (
            mode === "subscribe" &&
            token === process.env.WHATSAPP_VERIFY_TOKEN
        ) {
            console.log("✅ WEBHOOK VERIFIED");

            return res.status(200).send(challenge);
        }

        console.log("❌ WEBHOOK VERIFICATION FAILED");

        return res.sendStatus(403);
    }

    // --------------------------------
    // WHATSAPP EVENTS
    // --------------------------------
    if (req.method === "POST") {

        console.log("📩 WhatsApp webhook received");

        console.log(
            JSON.stringify(req.body, null, 2)
        );

        try {

            const entry = req.body?.entry?.[0];

            const changes = entry?.changes?.[0];

            const value = changes?.value;

            const messages = value?.messages;

            // No incoming message
            if (!messages || messages.length === 0) {
                console.log("No incoming message");

                return res.status(200).json({
                    success: true,
                });
            }

            const message = messages[0];

            console.log("Message type:", message.type);
            console.log("Incoming message ID:", message.id);
            console.log("From:", message.from);

            // --------------------------------
            // BUTTON CLICK
            // --------------------------------
            if (message.type === "button") {

                const buttonText = message.button?.text;
                const buttonPayload = message.button?.payload;

                console.log("Button text:", buttonText);
                console.log("Button payload:", buttonPayload);

                // ID of the original WhatsApp message
                const originalMessageId = message.context?.id;

                console.log(
                    "Original WhatsApp message ID:",
                    originalMessageId
                );

                if (!originalMessageId) {

                    console.log(
                        "❌ Original message ID not found"
                    );

                    return res.status(200).json({
                        success: true,
                    });
                }

                // --------------------------------
                // FIND REMINDER
                // --------------------------------

                const reminderLog = await ReminderLog.findOne({
                    where: {
                        msgid: originalMessageId,
                    },
                });

                if (!reminderLog) {

                    console.log(
                        "❌ No ReminderLog found for message:",
                        originalMessageId
                    );

                    return res.status(200).json({
                        success: true,
                    });
                }

                console.log("✅ ReminderLog found");
                console.log("Reminder ID:", reminderLog.reminderid);
                console.log("Task ID:", reminderLog.taskid);
                console.log("Staff ID:", reminderLog.staffid);

                const taskId = reminderLog.taskid;

                console.log(
                    "🎯 TASK ID:",
                    taskId
                );

                // --------------------------------
                // HANDLE DONE
                // --------------------------------

                if (buttonPayload === "DONE") {

                    console.log(
                        `✅ Staff completed task ${taskId}`
                    );

                    // Update your task here
                    //
                    // await Task.update(
                    //     { status: "completed" },
                    //     { where: { id: taskId } }
                    // );
                }
            }

            return res.status(200).json({
                success: true,
            });

        } catch (error) {

            console.error(
                "❌ Webhook processing error:",
                error
            );

            // Still acknowledge Meta
            return res.status(200).json({
                success: false,
            });
        }
    }

    return res.sendStatus(405);
}

module.exports = {
    webhook,
};