const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { changePassword } = require("../controllers/authController");
const {
  getApplications,
  approveApplication,
  rejectApplication,
  getStudents,
  updateStudentLevel,
  unlockNextLevel,
  updateStudentTopic,
  resetStudentPassword,
  deleteStudent
} = require("../controllers/adminController");

const router = express.Router();

// Allow password updates even if a client accidentally prefixes `/api/admin`.
router.patch("/auth/change-password", authMiddleware, changePassword);

router.use(authMiddleware, adminMiddleware);

router.get("/applications", getApplications);
router.patch("/applications/:id/approve", approveApplication);
router.patch("/applications/:id/reject", rejectApplication);

router.get("/students", getStudents);
router.patch("/students/:id/level", updateStudentLevel);
router.patch("/students/:id/unlock-next-level", unlockNextLevel);
router.patch("/students/:id/topic", updateStudentTopic);
router.patch("/students/:id/reset-password", resetStudentPassword);
router.delete("/students/:id", deleteStudent);

module.exports = router;
