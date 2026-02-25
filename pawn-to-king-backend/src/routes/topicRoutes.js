const express = require("express");
const { getCurrentTopic, getTopicsByLevel } = require("../controllers/topicController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Must be before /:level so "current" is not treated as a level param
router.get("/current", authMiddleware, getCurrentTopic);
router.get("/:level", authMiddleware, getTopicsByLevel);

module.exports = router;

