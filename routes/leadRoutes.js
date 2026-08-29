const express = require("express");

const {
  getLeads,
  getLeadById,
  createLead,
  deleteLead,
} = require("../controllers/leadController");

const router = express.Router();

router.get("/", getLeads);

router.get("/:id", getLeadById);

router.post("/", createLead);

router.delete("/:id", deleteLead);

module.exports = router;