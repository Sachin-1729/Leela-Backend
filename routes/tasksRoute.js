const express = require("express");
const {verifyToken} = require("../middleware/verifyToken");
const {  createTasks,
    getTasks} = require("../controllers/tasksController")

const router = express.Router();


router.post("/" , verifyToken  , createTasks);
router.get("/" , verifyToken , getTasks);

module.exports = router;