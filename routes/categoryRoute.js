const express = require("express");
const {verifyToken} = require("../middleware/verifyToken");
const router = express.Router();
const {createCategory , getCategory , getAllcategory} = require("../controllers/categoryController")

router.post("/" , verifyToken , createCategory);
router.get("/" , verifyToken , getCategory);
router.get("/all" , verifyToken , getAllcategory)

module.exports = router;