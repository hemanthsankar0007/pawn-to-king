const User = require("../models/User");
const Batch = require("../models/Batch");
const Session = require("../models/Session");
const Topic = require("../models/Topic");

const NO_BATCH_MESSAGE = "No batch assigned.";
const NO_SESSION_MESSAGE = "No class is currently scheduled. Please check back later or contact the academy.";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getNextSessionPayload = async (userId) => {
  const student = await User.findById(userId).select("_id role batchId").lean();

  if (!student) {
    return {
      status: 404,
      payload: { message: "User not found" }
    };
  }

  // Admin: return ALL upcoming sessions across all batches
  if (student.role === "admin") {
    const sessions = await Session.find({
      date: { $gte: startOfToday() },
      status: "Scheduled"
    })
      .sort({ date: 1, startTime: 1 })
      .limit(20)
      .lean();

    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const batch = await Batch.findById(session.batchId)
          .select("name level timezone meetLink")
          .lean();
        const topicDoc = await Topic.findOne({
          levelName: batch?.level,
          orderNumber: session.topic
        })
          .select("title")
          .lean();
        return {
          _id: session._id,
          reason: "scheduled",
          sessionDate: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          topic: session.topic,
          topicTitle: topicDoc?.title || `Topic ${session.topic}`,
          meetLink: session.meetLink || batch?.meetLink || "",
          batchName: batch?.name || "Unknown Batch",
          level: batch?.level || "",
          timezone: batch?.timezone || "IST"
        };
      })
    );

    return {
      status: 200,
      payload: { role: "admin", sessions: enriched }
    };
  }

  if (!student.batchId) {
    return {
      status: 200,
      payload: {
        reason: "no_batch",
        message: NO_BATCH_MESSAGE
      }
    };
  }

  const batch = await Batch.findById(student.batchId).select("_id name level timezone meetLink").lean();
  if (!batch) {
    await User.findByIdAndUpdate(student._id, { $set: { batchId: null } });
    return {
      status: 200,
      payload: {
        reason: "no_batch",
        message: NO_BATCH_MESSAGE
      }
    };
  }

  const session = await Session.findOne({
    batchId: batch._id,
    date: { $gte: startOfToday() },
    status: "Scheduled"
  })
    .sort({ date: 1, startTime: 1 })
    .select("date startTime endTime topic meetLink batchId")
    .lean();

  if (!session) {
    return {
      status: 200,
      payload: {
        reason: "no_session",
        message: NO_SESSION_MESSAGE,
        batchName: batch.name,
        level: batch.level
      }
    };
  }

  const topicDoc = await Topic.findOne({
    levelName: batch.level,
    orderNumber: session.topic
  })
    .select("title")
    .lean();

  return {
    status: 200,
    payload: {
      reason: "scheduled",
      sessionDate: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      topic: session.topic,
      topicTitle: topicDoc?.title || `Topic ${session.topic}`,
      meetLink: session.meetLink || batch.meetLink || "",
      batchName: batch.name,
      level: batch.level,
      timezone: batch.timezone || "IST"
    }
  };
};

const getNextClassroomSession = async (req, res) => {
  try {
    const result = await getNextSessionPayload(req.user.userId);
    return res.status(result.status).json(result.payload);
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load classroom details right now" });
  }
};

const getClassroom = async (req, res) => {
  return getNextClassroomSession(req, res);
};

const requestClassroomAccess = async (req, res) => {
  try {
    const result = await getNextSessionPayload(req.user.userId);

    if (result.status !== 200) {
      return res.status(result.status).json(result.payload);
    }

    if (result.payload.reason !== "scheduled" || !result.payload.meetLink) {
      return res.status(403).json({
        accessGranted: false,
        message:
          result.payload.reason === "no_batch"
            ? "You have not yet been assigned to a batch. Please contact admin."
            : NO_SESSION_MESSAGE
      });
    }

    return res.json({
      accessGranted: true,
      meetingLink: result.payload.meetLink
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to verify classroom access right now" });
  }
};

module.exports = {
  getClassroom,
  getNextClassroomSession,
  requestClassroomAccess
};
