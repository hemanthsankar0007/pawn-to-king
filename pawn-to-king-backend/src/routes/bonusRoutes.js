const express = require("express");
const { getBonusMaterials } = require("../controllers/bonusController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getBonusMaterials);

module.exports = router;

