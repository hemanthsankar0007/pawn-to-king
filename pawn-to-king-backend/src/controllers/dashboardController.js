const User = require("../models/User");
const Topic = require("../models/Topic");
const Submission = require("../models/Submission");
const { MAX_TOPICS_PER_LEVEL } = require("../utils/constants");
const { ensureAppConfig } = require("../config/appConfig");

const getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "_id name email chessRating age phone currentLevel currentTopic role batchId finalSchedule"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const levelTopics = await Topic.find({ levelName: user.currentLevel }).select("_id").lean();
    const totalTopics = levelTopics.length || MAX_TOPICS_PER_LEVEL;

    const completedTopics =
      levelTopics.length > 0
        ? await Submission.countDocuments({
            userId: user._id,
            topicId: { $in: levelTopics.map((topic) => topic._id) },
            completed: true
          })
        : Math.min(Math.max(user.currentTopic - 1, 0), MAX_TOPICS_PER_LEVEL);

    const progressPercentage = Math.max(
      0,
      Math.min(100, Math.round((completedTopics / totalTopics) * 100))
    );

    let homeworkLink = "";
    try {
      const config = await ensureAppConfig();
      homeworkLink = config.defaultHomeworkLink || "";
    } catch (_error) {
      homeworkLink = "";
    }

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        chessRating: user.chessRating,
        age: user.age,
        phone: user.phone,
        currentLevel: user.currentLevel,
        currentTopic: user.currentTopic,
        role: user.role,
        batchId: user.batchId,
        finalSchedule: user.finalSchedule || { days: [], time: "", timezone: "" }
      },
      progress: {
        percentage: progressPercentage,
        currentLevel: user.currentLevel,
        currentTopic: user.currentTopic,
        completedTopics,
        totalTopics
      },
      homeworkLink,
      progressPercentage,
      completedTopics,
      totalTopics
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load dashboard right now" });
  }
};

module.exports = {
  getDashboard
};
