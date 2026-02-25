const User = require("../models/User");
const Batch = require("../models/Batch");
const Session = require("../models/Session");
const Topic = require("../models/Topic");

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

// Build a lookup map from DB topics: "Pawn-1" -> "Understanding the Chessboard"
const buildTopicTitleMap = async (sessions) => {
  // Collect unique (level, topicNumber) pairs
  const pairs = [];
  const seen = new Set();
  sessions.forEach((s) => {
    const key = `${s.level}-${s.topic}`;
    if (!seen.has(key) && s.level && s.topic) {
      seen.add(key);
      pairs.push({ levelName: s.level, orderNumber: s.topic });
    }
  });

  if (pairs.length === 0) return {};

  // Single DB query — fetch all needed topics at once
  const levels = [...new Set(pairs.map((p) => p.levelName))];
  const orderNumbers = [...new Set(pairs.map((p) => p.orderNumber))];

  const topics = await Topic.find({
    levelName: { $in: levels },
    orderNumber: { $in: orderNumbers }
  })
    .select("levelName orderNumber title")
    .lean();

  const map = {};
  topics.forEach((t) => {
    map[`${t.levelName}-${t.orderNumber}`] = t.title;
  });
  return map;
};

const enrichSessions = (sessions, titleMap) =>
  sessions.map((s) => ({
    ...s,
    topicTitle: titleMap[`${s.level}-${s.topic}`] || null
  }));

const getTimetable = async (req, res) => {
  try {
    const student = await User.findById(req.user.userId)
      .select("_id name email role batchId currentLevel")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (student.role !== "student") {
      return res.status(403).json({ message: "Only students can access timetable." });
    }

    if (!student.batchId) {
      return res.json({
        message: "You have not yet been assigned to a batch.",
        batch: null,
        upcomingSessions: [],
        pastSessions: []
      });
    }

    const [batch, sessions] = await Promise.all([
      Batch.findById(student.batchId).select("_id name level days time timezone meetLink").lean(),
      Session.find({ batchId: student.batchId }).sort({ date: 1, startTime: 1 }).lean()
    ]);

    if (!batch) {
      return res.json({
        message: "You have not yet been assigned to a batch.",
        batch: null,
        upcomingSessions: [],
        pastSessions: []
      });
    }

    // One batch query to resolve topic titles — no N+1
    const titleMap = await buildTopicTitleMap(sessions);

    const today = startOfToday();
    const upcomingSessions = [];
    const pastSessions = [];

    enrichSessions(sessions, titleMap).forEach((session) => {
      if (new Date(session.date) >= today) {
        upcomingSessions.push(session);
      } else {
        pastSessions.push(session);
      }
    });

    return res.json({
      batch,
      upcomingSessions,
      pastSessions
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load timetable right now." });
  }
};

module.exports = {
  getTimetable
};
