const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getStudentsForBatchAssignment,
  assignStudentsToBatch
} = require("../controllers/adminTimetableController");

const router = express.Router();

router.get("/students", authMiddleware, adminMiddleware, getStudentsForBatchAssignment);
router.put("/batch/assign", authMiddleware, adminMiddleware, assignStudentsToBatch);
router.put("/batches/:batchId/assign", authMiddleware, adminMiddleware, assignStudentsToBatch);

module.exports = router;
