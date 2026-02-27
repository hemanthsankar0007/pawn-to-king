const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  createBatch,
  updateBatch,
  getBatches,
  getBatchStudents,
  getStudentsForBatchAssignment,
  assignStudentsToBatch,
  generateSessions,
  getSessions,
  markSessionCompleted,
  cancelSession,
  rescheduleSession,
  deleteBatch,
  removeStudentFromBatch,
  getWeeklyTimetable
} = require("../controllers/adminTimetableController");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.post("/batches", createBatch);
router.get("/batches", getBatches);
router.patch("/batches/:batchId", updateBatch);
router.delete("/batches/:batchId", deleteBatch);
router.get("/batches/:batchId/students", getBatchStudents);
router.patch("/batches/:batchId/remove-student/:studentId", removeStudentFromBatch);

router.get("/weekly", getWeeklyTimetable);

router.get("/students", getStudentsForBatchAssignment);
router.patch("/batches/:batchId/students", assignStudentsToBatch);
router.post("/batches/:batchId/generate-sessions", generateSessions);

router.get("/sessions", getSessions);
router.patch("/sessions/:sessionId/complete", markSessionCompleted);
router.patch("/sessions/:sessionId/cancel", cancelSession);
router.patch("/sessions/:sessionId/reschedule", rescheduleSession);

module.exports = router;
