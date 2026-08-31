const express = require("express");
const {verifyToken} = require("../middleware/verifyToken");
const router = express.Router();
const {createCategory , getCategory} = require("../controllers/categoryController")

router.post("/" , verifyToken , createCategory);
router.get("/" , verifyToken , getCategory);

module.exports = router;