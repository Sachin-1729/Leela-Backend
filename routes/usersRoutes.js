const express = require("express");
const {verifyToken} = require("../middleware/verifyToken")

const {
  signin,
  users
} = require("../controllers/usersController");

const router = express.Router();

router.post("/signin", signin);
router.get("/" , verifyToken , users);



module.exports = router;