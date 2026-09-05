const express = require("express");


const {
  webhook
} = require("../controllers/webhookController");

const router = express.Router();

router.get("/", webhook);
router.post("/" , webhook);




module.exports = router;