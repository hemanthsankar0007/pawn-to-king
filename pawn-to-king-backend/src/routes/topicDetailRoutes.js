const express = require("express");
const { getTopicByLevelAndNumber } = require("../controllers/topicController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:level/:number", authMiddleware, getTopicByLevelAndNumber);

module.exports = router;
