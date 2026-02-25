const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getApplications,
  approveApplication,
  rejectApplication,
  getStudents,
  updateStudentLevel,
  unlockNextLevel,
  updateStudentTopic,
  resetStudentPassword
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/applications", getApplications);
router.patch("/applications/:id/approve", approveApplication);
router.patch("/applications/:id/reject", rejectApplication);

router.get("/students", getStudents);
router.patch("/students/:id/level", updateStudentLevel);
router.patch("/students/:id/unlock-next-level", unlockNextLevel);
router.patch("/students/:id/topic", updateStudentTopic);
router.patch("/students/:id/reset-password", resetStudentPassword);

module.exports = router;
