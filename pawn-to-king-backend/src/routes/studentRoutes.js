const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getCurrentStudent } = require("../controllers/studentController");

const router = express.Router();

router.get("/me", authMiddleware, getCurrentStudent);

module.exports = router;
