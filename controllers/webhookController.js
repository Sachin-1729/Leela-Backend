const ReminderLog = require("../models/ReminderLog");
const Task = require("../models/Tasks");

// Text/payload that means "task done"
const DONE_KEYWORDS = ["done", "✅ done", "completed", "complete"];

const isDone = (value) => {
    if (!value) return false;

    return DONE_KEYWORDS.includes(
        String(value).trim().toLowerCase()
    );
};

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
            // template quick reply  -> type "button"
            // interactive button    -> type "interactive"
            // --------------------------------
            const isButtonReply =
                message.type === "button" ||
                (message.type === "interactive" &&
                    message.interactive?.type === "button_reply");

            if (!isButtonReply) {

                console.log("Not a button reply, ignoring");

                return res.status(200).json({
                    success: true,
                });
            }

            const buttonText =
                message.button?.text ||
                message.interactive?.button_reply?.title;

            const buttonPayload =
                message.button?.payload ||
                message.interactive?.button_reply?.id;

            console.log("Button text:", buttonText);
            console.log("Button payload:", buttonPayload);

            // ID of the original WhatsApp message (the reminder we sent)
            const originalMessageId = message.context?.id;

            console.log(
                "Original WhatsApp message ID:",
                originalMessageId
            );

            if (!originalMessageId) {

                console.log("❌ Original message ID not found");

                return res.status(200).json({
                    success: true,
                });
            }

            // --------------------------------
            // FIND REMINDER LOG BY MESSAGE ID
            // --------------------------------

            const reminderLog = await ReminderLog.findOne({
                where: {
                    msgid: originalMessageId,
                },
                order: [["createdAt", "DESC"]],
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

            console.log("🎯 TASK ID:", taskId);

            // --------------------------------
            // HANDLE DONE
            // --------------------------------

            if (!isDone(buttonPayload) && !isDone(buttonText)) {

                console.log(
                    "Button is not a DONE confirmation, ignoring"
                );

                return res.status(200).json({
                    success: true,
                });
            }

            const task = await Task.findByPk(taskId);

            if (!task) {

                console.log("❌ Task not found:", taskId);

                return res.status(200).json({
                    success: true,
                });
            }

            // Only the staff the reminder was sent to can complete it
            if (task.staffId !== reminderLog.staffid) {

                console.log(
                    "❌ Task staff mismatch",
                    task.staffId,
                    reminderLog.staffid
                );

                return res.status(200).json({
                    success: true,
                });
            }

            // Meta retries webhooks -> keep this idempotent
            if (task.status === "completed") {

                console.log(
                    `Task ${taskId} already completed, skipping`
                );

                return res.status(200).json({
                    success: true,
                });
            }

            await task.update({
                status: "completed",
            });

            await reminderLog.update({
                status: "completed",
            });

            console.log(
                `✅ Staff ${reminderLog.staffid} completed task ${taskId}`
            );

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
