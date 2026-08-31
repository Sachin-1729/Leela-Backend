const express = require("express");
const { verifyToken } = require("../middleware/verifyToken");
const { createEvent, getEvents, getEventById } = require("../controllers/eventController")
const router = express.Router();
router.post("/", verifyToken, createEvent);
router.get("/" , verifyToken , getEvents);
router.get("/:id" , verifyToken , getEventById)

module.exports = router;