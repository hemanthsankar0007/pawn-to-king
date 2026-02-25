const CurriculumTopic = require("../models/CurriculumTopic");
const { CURRICULUM_LEVELS, levelOrder } = require("../data/curriculumBlueprint");

const levelSummaryMap = new Map(
  CURRICULUM_LEVELS.map((entry) => [
    entry.levelName,
    {
      description: entry.description,
      expectedTopicCount: entry.sections.reduce((count, section) => count + section.topics.length, 0)
    }
  ])
);

const buildLearnings = (topic) => {
  const fromObjective = topic.learningObjective ? [topic.learningObjective] : [];
  const generated = [
    `Recognize practical patterns for ${topic.title.toLowerCase()}.`,
    `Apply this concept with stronger calculation and decision-making.`
  ];

  return [...fromObjective, ...generated];
};

const formatLevelPayload = (levelName, topics) => {
  const sectionMap = new Map();

  topics.forEach((topic) => {
    if (!sectionMap.has(topic.sectionName)) {
      sectionMap.set(topic.sectionName, []);
    }

    sectionMap.get(topic.sectionName).push({
      orderNumber: topic.orderNumber,
      id: String(topic._id),
      title: topic.title,
      difficulty: topic.difficultyLevel,
      description: topic.shortDescription,
      learnings: buildLearnings(topic),
      duration: topic.estimatedDuration
    });
  });

  const sections = Array.from(sectionMap.entries()).map(([name, sectionTopics]) => ({
    name,
    topicCount: sectionTopics.length,
    topics: sectionTopics
      .sort((a, b) => a.orderNumber - b.orderNumber)
      .map(({ orderNumber, ...topicPayload }) => topicPayload)
  }));

  const summary = levelSummaryMap.get(levelName) || {};

  return {
    levelName,
    slug: levelName.toLowerCase(),
    description: summary.description || "",
    totalTopics: topics.length,
    expectedTopicCount: summary.expectedTopicCount || topics.length,
    sections
  };
};

const getCurriculum = async (_req, res) => {
  try {
    const docs = await CurriculumTopic.find()
      .select(
        "levelName sectionName orderNumber title shortDescription difficultyLevel estimatedDuration learningObjective"
      )
      .sort({ levelName: 1, orderNumber: 1 })
      .lean();

    const grouped = docs.reduce((accumulator, topic) => {
      if (!accumulator.has(topic.levelName)) {
        accumulator.set(topic.levelName, []);
      }
      accumulator.get(topic.levelName).push(topic);
      return accumulator;
    }, new Map());

    const levels = Array.from(grouped.entries())
      .map(([levelName, topics]) => formatLevelPayload(levelName, topics))
      .sort((a, b) => (levelOrder.get(a.levelName) ?? 99) - (levelOrder.get(b.levelName) ?? 99));

    return res.json({
      totalTopics: levels.reduce((sum, level) => sum + level.totalTopics, 0),
      levels
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load curriculum right now" });
  }
};

const getCurriculumByLevel = async (req, res) => {
  try {
    const levelParam = String(req.params.level || "").toLowerCase();
    const targetLevel = CURRICULUM_LEVELS.find(
      (entry) => entry.levelName.toLowerCase() === levelParam
    )?.levelName;

    if (!targetLevel) {
      return res.status(404).json({ message: "Curriculum level not found" });
    }

    const docs = await CurriculumTopic.find({ levelName: targetLevel })
      .select(
        "levelName sectionName orderNumber title shortDescription difficultyLevel estimatedDuration learningObjective"
      )
      .sort({ orderNumber: 1 })
      .lean();

    if (docs.length === 0) {
      return res.status(404).json({ message: "Curriculum level not found" });
    }

    return res.json({
      level: formatLevelPayload(targetLevel, docs)
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load this curriculum level right now" });
  }
};

module.exports = {
  getCurriculum,
  getCurriculumByLevel
};
