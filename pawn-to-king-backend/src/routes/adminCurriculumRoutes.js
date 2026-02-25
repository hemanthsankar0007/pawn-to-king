const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const Topic = require("../models/Topic");

// GET /api/admin/curriculum/topics/:levelName
router.get("/topics/:levelName", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { levelName } = req.params;
    const topics = await Topic.find({ levelName })
      .sort({ orderNumber: 1 })
      .select("_id orderNumber title homeworkLink");
    res.json({ topics });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch topics" });
  }
});

// PUT /api/admin/curriculum/topic/:id/homework
router.put("/topic/:id/homework", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { homeworkLink } = req.body;

    const updated = await Topic.findByIdAndUpdate(
      id,
      { homeworkLink: homeworkLink?.trim() || null },
      { new: true, select: "_id orderNumber title homeworkLink" }
    );

    if (!updated) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.json({ topic: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update homework link" });
  }
});

module.exports = router;
