const express = require("express");
const {
  getClassroom,
  getNextClassroomSession,
  requestClassroomAccess
} = require("../controllers/classroomController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getClassroom);
router.get("/next-session", authMiddleware, getNextClassroomSession);
router.post("/access", authMiddleware, requestClassroomAccess);

module.exports = router;
