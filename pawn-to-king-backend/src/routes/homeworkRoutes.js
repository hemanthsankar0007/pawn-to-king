const express = require("express");
const { submitHomework } = require("../controllers/homeworkController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/submit", authMiddleware, submitHomework);

module.exports = router;

