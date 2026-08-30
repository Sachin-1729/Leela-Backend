const express = require("express");
const {verifyToken} = require("../middleware/verifyToken")

const {
  getLeads,
  getLeadById,
  createLead,
  deleteLead,
} = require("../controllers/leadController");

const router = express.Router();

router.get("/", verifyToken, getLeads);

router.get("/:id", verifyToken , getLeadById);

router.post("/", createLead);

router.delete("/:id", verifyToken , deleteLead);

module.exports = router;