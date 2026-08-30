const express = require("express");
const {verifyToken} = require("../middleware/verifyToken");
const {createStaff , getStaffs} = require("../controllers/staffController")

const router = express.Router();


router.post("/" , verifyToken  , createStaff);
router.get("/" , verifyToken , getStaffs);

module.exports = router;