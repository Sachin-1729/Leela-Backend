const express = require("express");
const {verifyToken} = require("../middleware/verifyToken")

const {
  getCommunityRequests,
  createCommunityRequest,
} = require("../controllers/communityRequestController");

const router = express.Router();

router.get("/", verifyToken, getCommunityRequests);

router.post("/", createCommunityRequest);

module.exports = router;
