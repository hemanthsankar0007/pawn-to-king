const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getStudentsForBatchAssignment,
  assignStudentsToBatch
} = require("../controllers/adminTimetableController");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/students", getStudentsForBatchAssignment);
router.put("/batch/assign", assignStudentsToBatch);
router.put("/batches/:batchId/assign", assignStudentsToBatch);

module.exports = router;
