const express = require("express");
const {verifyToken} = require("../middleware/verifyToken");
const {createStaff , getStaffs , getAllStaff} = require("../controllers/staffController")

const router = express.Router();


router.post("/" , verifyToken  , createStaff);
router.get("/" , verifyToken , getStaffs);
router.get("/all" , verifyToken , getAllStaff);

module.exports = router;