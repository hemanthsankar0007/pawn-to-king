const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { login, changePassword } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.patch("/change-password", authMiddleware, changePassword);

module.exports = router;
