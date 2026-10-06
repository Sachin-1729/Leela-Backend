const express = require("express");
const { verifyToken } = require("../middleware/verifyToken");
const { createEvent, getEvents, getEventById } = require("../controllers/eventController")
const { getEventGuests, replaceEventGuests } = require("../controllers/eventGuestController")
const router = express.Router();
router.post("/", verifyToken, createEvent);
router.get("/" , verifyToken , getEvents);
router.get("/:id" , verifyToken , getEventById)
router.get("/:id/guests" , verifyToken , getEventGuests)
router.put("/:id/guests" , verifyToken , replaceEventGuests)

module.exports = router;