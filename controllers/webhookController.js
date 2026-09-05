async function webhook(req, res) {

    console.log("🔥 WEBHOOK HIT");
    console.log("Method:", req.method);
    console.log("Query:", req.query);
    console.log("Body:", req.body);

    // Meta webhook verification
    if (req.method === "GET") {

        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        console.log("Mode:", mode);
        console.log("Verify Token:", token);
        console.log("Challenge:", challenge);

        if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            console.log("✅ WEBHOOK VERIFIED");

            return res.status(200).send(challenge);
        }

        console.log("❌ WEBHOOK VERIFICATION FAILED");

        return res.sendStatus(403);
    }

    // WhatsApp events
    if (req.method === "POST") {

        console.log("📩 WhatsApp webhook received");
        console.log(JSON.stringify(req.body, null, 2));

        return res.status(200).json({
            success: true
        });
    }

    return res.sendStatus(405);
}

module.exports = {
    webhook,
};