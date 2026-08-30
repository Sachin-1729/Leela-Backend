const express = require("express");
const { verifyToken } = require("../middleware/verifyToken");
const { createEvent, getEvents } = require("../controllers/eventController")
const router = express.Router();
router.post("/", verifyToken, createEvent);
router.get("/" , verifyToken , getEvents);

module.exports = router;