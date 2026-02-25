const User = require("../models/User");
const Topic = require("../models/Topic");
const Submission = require("../models/Submission");
const { LEVEL_NAMES, MAX_TOPICS_PER_LEVEL, PASSING_SCORE } = require("../utils/constants");

const normalizeAnswer = (value) => String(value || "").trim().toLowerCase();
const normalizeLevel = (rawLevel) =>
  LEVEL_NAMES.find((name) => name.toLowerCase() === String(rawLevel || "").toLowerCase());

const submitHomework = async (req, res) => {
  try {
    const { topicId, level, topicNumber, answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required to submit homework" });
    }

    const user = await User.findById(req.user.userId).select("currentLevel currentTopic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let topic = null;
    if (topicId) {
      topic = await Topic.findById(topicId);
    } else {
      const normalizedLevel = normalizeLevel(level);
      const parsedTopicNumber = Number.parseInt(topicNumber, 10);
      if (!normalizedLevel || Number.isNaN(parsedTopicNumber) || parsedTopicNumber < 1) {
        return res.status(400).json({ message: "Valid topic information is required" });
      }
      topic = await Topic.findOne({ levelName: normalizedLevel, orderNumber: parsedTopicNumber });
    }

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (topic.levelName !== user.currentLevel) {
      return res.status(403).json({ message: "Homework can only be submitted for your current level" });
    }

    if (topic.orderNumber > user.currentTopic) {
      return res.status(403).json({ message: "This topic is currently locked" });
    }

    const answerMap = new Map();
    for (const answerEntry of answers) {
      if (
        answerEntry &&
        Number.isInteger(answerEntry.questionIndex) &&
        answerEntry.questionIndex >= 0
      ) {
        answerMap.set(answerEntry.questionIndex, answerEntry.answer ?? "");
      }
    }

    const existingSubmission = await Submission.findOne({
      userId: user._id,
      topicId: topic._id
    }).select("completed");

    let correctCount = 0;
    const totalQuestions = topic.homeworkQuestions.length;

    topic.homeworkQuestions.forEach((question, index) => {
      const submitted = normalizeAnswer(answerMap.get(index));

      if (!submitted) {
        return;
      }

      if (question.type === "mcq") {
        const expected = normalizeAnswer(question.correctAnswer);
        if (submitted === expected) {
          correctCount += 1;
        }
        return;
      }

      // Text answers are participation-graded while MCQs are strictly validated.
      if (submitted.length >= 8) {
        correctCount += 1;
      }
    });

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= PASSING_SCORE;

    const completedStatus = passed || Boolean(existingSubmission?.completed);

    await Submission.findOneAndUpdate(
      { userId: user._id, topicId: topic._id },
      {
        userId: user._id,
        topicId: topic._id,
        answers: answers.map((answerEntry) => ({
          questionIndex: answerEntry.questionIndex,
          answer: String(answerEntry.answer || "")
        })),
        score,
        completed: completedStatus
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    let requiresManualLevelUpgrade = user.currentTopic > MAX_TOPICS_PER_LEVEL;

    if (passed && topic.orderNumber === user.currentTopic && user.currentTopic <= MAX_TOPICS_PER_LEVEL) {
      user.currentTopic += 1;
      if (user.currentTopic > MAX_TOPICS_PER_LEVEL) {
        requiresManualLevelUpgrade = true;
      }
      await user.save();
    }

    return res.json({
      message: passed ? "Homework passed and topic marked complete" : "Homework submitted",
      score,
      passed,
      completedTopic: topic.orderNumber,
      levelName: topic.levelName,
      currentTopic: user.currentTopic,
      requiresManualLevelUpgrade
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to submit homework right now" });
  }
};

module.exports = {
  submitHomework
};
