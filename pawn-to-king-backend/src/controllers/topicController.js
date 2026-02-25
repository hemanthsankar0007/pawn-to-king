const User = require("../models/User");
const Topic = require("../models/Topic");
const Submission = require("../models/Submission");
const { LEVEL_NAMES } = require("../utils/constants");

const levelIndexMap = new Map(LEVEL_NAMES.map((name, index) => [name.toLowerCase(), index]));

const normalizeLevel = (rawLevel) =>
  LEVEL_NAMES.find((name) => name.toLowerCase() === String(rawLevel || "").toLowerCase());

const getAccessState = (userLevel, requestedLevel, topicNumber, currentTopic) => {
  const userLevelIndex = levelIndexMap.get(String(userLevel).toLowerCase());
  const requestedLevelIndex = levelIndexMap.get(String(requestedLevel).toLowerCase());

  if (requestedLevelIndex < userLevelIndex) {
    return { isLocked: false, isPastLevel: true };
  }

  if (requestedLevelIndex > userLevelIndex) {
    return { isLocked: true, isPastLevel: false };
  }

  return { isLocked: topicNumber > currentTopic, isPastLevel: false };
};

const getCurrentTopic = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("currentLevel currentTopic")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const topic = await Topic.findOne({
      levelName: user.currentLevel,
      orderNumber: user.currentTopic
    })
      .select("title orderNumber levelName homeworkLink")
      .lean();

    // Resolve homework link: topic-level overrides config fallback
    let homeworkLink = topic?.homeworkLink || null;
    if (!homeworkLink) {
      try {
        const { ensureAppConfig } = require("../config/appConfig");
        const config = await ensureAppConfig();
        homeworkLink = config.defaultHomeworkLink || null;
      } catch (_error) {
        homeworkLink = null;
      }
    }

    return res.json({
      level: user.currentLevel,
      topicNumber: user.currentTopic,
      title: topic?.title || null,
      homeworkLink
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load current topic right now" });
  }
};

const getTopicsByLevel = async (req, res) => {
  try {
    const normalizedLevel = normalizeLevel(req.params.level);
    if (!normalizedLevel) {
      return res.status(400).json({ message: "Invalid level requested" });
    }

    const user = await User.findById(req.user.userId).select("currentLevel currentTopic");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const topics = await Topic.find({ levelName: normalizedLevel })
      .sort({ orderNumber: 1 })
      .select("_id levelName orderNumber title")
      .lean();

    const topicIds = topics.map((topic) => topic._id);
    const submissions =
      topicIds.length > 0
        ? await Submission.find({
            userId: user._id,
            topicId: { $in: topicIds }
          })
            .select("topicId completed score")
            .lean()
        : [];

    const submissionMap = new Map(
      submissions.map((submission) => [String(submission.topicId), submission])
    );

    const safeTopics = topics.map((topic) => {
      const submission = submissionMap.get(String(topic._id));
      const accessState = getAccessState(
        user.currentLevel,
        topic.levelName,
        topic.orderNumber,
        user.currentTopic
      );
      const sequentiallyCompleted =
        topic.levelName === user.currentLevel && topic.orderNumber < user.currentTopic;

      return {
        _id: topic._id,
        levelName: topic.levelName,
        orderNumber: topic.orderNumber,
        title: topic.title,
        isCompleted: accessState.isPastLevel || sequentiallyCompleted || Boolean(submission?.completed),
        isLocked: accessState.isLocked,
        lastScore: submission?.score ?? null
      };
    });

    return res.json({
      level: normalizedLevel,
      currentLevel: user.currentLevel,
      currentTopic: user.currentTopic,
      topics: safeTopics
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load topics right now" });
  }
};

const getTopicByLevelAndNumber = async (req, res) => {
  try {
    const normalizedLevel = normalizeLevel(req.params.level);
    const topicNumber = Number.parseInt(req.params.number, 10);

    if (!normalizedLevel || Number.isNaN(topicNumber) || topicNumber < 1) {
      return res.status(400).json({ message: "Invalid topic request" });
    }

    const user = await User.findById(req.user.userId).select("currentLevel currentTopic");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessState = getAccessState(user.currentLevel, normalizedLevel, topicNumber, user.currentTopic);
    if (accessState.isLocked) {
      return res.status(403).json({ message: "This topic is currently locked" });
    }

    const topic = await Topic.findOne({ levelName: normalizedLevel, orderNumber: topicNumber }).lean();
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const submission = await Submission.findOne({
      userId: user._id,
      topicId: topic._id
    })
      .select("score completed")
      .lean();

    const sequentiallyCompleted =
      topic.levelName === user.currentLevel && topic.orderNumber < user.currentTopic;

    return res.json({
      topic: {
        _id: topic._id,
        levelName: topic.levelName,
        orderNumber: topic.orderNumber,
        title: topic.title,
        content: topic.content,
        isCompleted: accessState.isPastLevel || sequentiallyCompleted || Boolean(submission?.completed),
        lastScore: submission?.score ?? null,
        homeworkQuestions: topic.homeworkQuestions.map((question, index) => ({
          questionIndex: index,
          question: question.question,
          type: question.type,
          options: question.options
        }))
      }
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load topic details right now" });
  }
};

module.exports = {
  getCurrentTopic,
  getTopicsByLevel,
  getTopicByLevelAndNumber
};
