const express = require("express");
const { getLevels } = require("../controllers/levelController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getLevels);

module.exports = router;
