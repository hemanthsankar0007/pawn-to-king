const User = require("../models/User");

const getCurrentStudent = async (req, res) => {
  try {
    const student = await User.findById(req.user.userId)
      .select("_id name email role currentLevel currentTopic batchId")
      .populate("batchId")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (student.role !== "student") {
      return res.status(403).json({ message: "Only students can access this endpoint." });
    }

    return res.json(student);
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load student profile right now." });
  }
};

module.exports = {
  getCurrentStudent
};
