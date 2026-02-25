const mongoose = require("mongoose");
const Batch = require("../models/Batch");
const Session = require("../models/Session");
const User = require("../models/User");
const { LEVEL_NAMES } = require("../utils/constants");

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const VALID_DAYS = new Set(DAY_NAMES);
const VALID_STATUSES = new Set(["Scheduled", "Completed", "Cancelled"]);
const TIME_POINT_REGEX = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;

const normalizeBatchDays = (days) => {
  if (!Array.isArray(days)) {
    return [];
  }

  return [...new Set(days.map((day) => String(day || "").trim()).filter(Boolean))];
};

const parseTimePoint = (rawValue) => {
  const value = String(rawValue || "").trim();
  const match = value.match(TIME_POINT_REGEX);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  return { hour, minute, period };
};

const to24Hour = ({ hour, minute, period }) => {
  let convertedHour = hour;
  if (period === "PM" && convertedHour !== 12) convertedHour += 12;
  if (period === "AM" && convertedHour === 12) convertedHour = 0;
  return convertedHour * 60 + minute;
};

const to12Hour = (totalMinutes) => {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  let hour = Math.floor(normalized / 60);
  const minute = normalized % 60;

  const period = hour >= 12 ? "PM" : "AM";
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;

  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
};

const parseTimeRange = (rawTime) => {
  const normalized = String(rawTime || "")
    .replace(/\u2013/g, "-")
    .trim();

  if (!normalized) {
    return null;
  }

  const pieces = normalized.split("-").map((piece) => piece.trim()).filter(Boolean);
  if (pieces.length === 0) {
    return null;
  }

  const startPoint = parseTimePoint(pieces[0]);
  if (!startPoint) {
    return null;
  }

  let endPoint = pieces[1] ? parseTimePoint(pieces[1]) : null;
  if (!endPoint) {
    endPoint = parseTimePoint(to12Hour(to24Hour(startPoint) + 60));
  }

  return {
    startTime: `${startPoint.hour}:${String(startPoint.minute).padStart(2, "0")} ${startPoint.period}`,
    endTime: `${endPoint.hour}:${String(endPoint.minute).padStart(2, "0")} ${endPoint.period}`
  };
};

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toDateKey = (value) => {
  const date = startOfDay(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const parseUrl = (value) => {
  try {
    const parsed = new URL(String(value || "").trim());
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch (_error) {
    return "";
  }
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

const createBatch = async (req, res) => {
  try {
    const { name, level, days, time, timezone, meetLink } = req.body || {};
    const trimmedName = String(name || "").trim();
    const normalizedLevel = String(level || "").trim();
    const normalizedDays = normalizeBatchDays(days);
    const normalizedTime = String(time || "").trim();
    const normalizedTimezone = String(timezone || "").trim();
    const normalizedMeetLink = parseUrl(meetLink);

    const errors = [];

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 80) {
      errors.push("Batch name must be between 2 and 80 characters.");
    }

    if (!LEVEL_NAMES.includes(normalizedLevel)) {
      errors.push("Valid level is required.");
    }

    if (normalizedDays.length === 0 || normalizedDays.some((day) => !VALID_DAYS.has(day))) {
      errors.push("At least one valid day is required.");
    }

    if (!parseTimeRange(normalizedTime)) {
      errors.push("Valid batch time is required (for example: 6:00 PM - 7:00 PM).");
    }

    if (!normalizedTimezone) {
      errors.push("Timezone is required.");
    }

    if (!normalizedMeetLink) {
      errors.push("Valid Meet link is required.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Please fix the batch details.", errors });
    }

    const batch = await Batch.create({
      name: trimmedName,
      level: normalizedLevel,
      days: normalizedDays,
      time: normalizedTime,
      timezone: normalizedTimezone,
      meetLink: normalizedMeetLink
    });

    return res.status(201).json({ message: "Batch created.", batch });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "A batch with this level and name already exists." });
    }
    return res.status(500).json({ message: "Unable to create batch right now." });
  }
};

const getBatches = async (req, res) => {
  try {
    const requestedLevel = String(req.query.level || "").trim();
    const filter = {};

    if (requestedLevel) {
      if (!LEVEL_NAMES.includes(requestedLevel)) {
        return res.status(400).json({ message: "Invalid level filter." });
      }
      filter.level = requestedLevel;
    }

    const batches = await Batch.find(filter).sort({ level: 1, name: 1 }).lean();
    const batchIds = batches.map((batch) => batch._id);

    const assignmentCounts =
      batchIds.length > 0
        ? await User.aggregate([
            {
              $match: {
                role: "student",
                batchId: { $in: batchIds }
              }
            },
            {
              $group: {
                _id: "$batchId",
                count: { $sum: 1 }
              }
            }
          ])
        : [];

    const countMap = new Map(
      assignmentCounts.map((entry) => [String(entry._id), Number(entry.count) || 0])
    );

    const normalizedBatches = batches.map((batch) => ({
      ...batch,
      assignedStudentCount: countMap.get(String(batch._id)) || 0
    }));

    return res.json({ batches: normalizedBatches });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load batches right now." });
  }
};

const getStudentsForBatchAssignment = async (_req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("_id name email currentLevel currentTopic batchId")
      .populate("batchId", "name level")
      .sort({ name: 1 })
      .lean();

    return res.json(students);
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load students right now." });
  }
};

const assignStudentsToBatch = async (req, res) => {
  try {
    const batchId = req.params?.batchId || req.body?.batchId;
    const { studentIds } = req.body || {};

    if (!mongoose.isValidObjectId(batchId)) {
      return res.status(400).json({ message: "Invalid batch id." });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    const normalizedIds = Array.isArray(studentIds)
      ? [...new Set(studentIds.map((id) => String(id || "").trim()).filter(Boolean))]
      : [];

    if (normalizedIds.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ message: "One or more student ids are invalid." });
    }

    const students = await User.find({
      _id: { $in: normalizedIds },
      role: "student"
    }).select("_id");

    if (students.length !== normalizedIds.length) {
      return res.status(400).json({ message: "One or more selected users are not valid students." });
    }

    await User.updateMany({ role: "student" }, { $set: { batchId: null } });

    if (normalizedIds.length > 0) {
      await User.updateMany({ _id: { $in: normalizedIds } }, { $set: { batchId: batch._id } });
    }

    return res.json({
      message: "Batch updated successfully",
      batchId: batch._id,
      assignedStudentCount: normalizedIds.length
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to assign students right now." });
  }
};

const generateSessions = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { daysAhead, limit, startTopic } = req.body || {};

    if (!mongoose.isValidObjectId(batchId)) {
      return res.status(400).json({ message: "Invalid batch id." });
    }

    const batch = await Batch.findById(batchId).lean();
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    const parsedTime = parseTimeRange(batch.time);
    if (!parsedTime) {
      return res.status(400).json({ message: "Batch time format is invalid." });
    }

    const cappedDaysAhead = Math.max(1, Math.min(90, parsePositiveInt(daysAhead, 30)));
    const cappedLimit = Math.max(8, Math.min(12, parsePositiveInt(limit, 10)));
    const today = startOfDay(new Date());
    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + cappedDaysAhead);

    const existingSessions = await Session.find({
      batchId,
      date: { $gte: today, $lte: rangeEnd }
    })
      .select("date startTime topic")
      .lean();

    const existingKeySet = new Set(
      existingSessions.map((session) => `${toDateKey(session.date)}|${session.startTime}`)
    );

    const maxTopicSession = await Session.findOne({ batchId }).sort({ topic: -1 }).select("topic").lean();
    let topicCounter = parsePositiveInt(startTopic, (maxTopicSession?.topic || 0) + 1);

    const generatedSessions = [];
    for (let offset = 0; offset <= cappedDaysAhead && generatedSessions.length < cappedLimit; offset += 1) {
      const sessionDate = new Date(today);
      sessionDate.setDate(sessionDate.getDate() + offset);
      const dayName = DAY_NAMES[sessionDate.getDay()];

      if (!batch.days.includes(dayName)) {
        continue;
      }

      const dateKey = toDateKey(sessionDate);
      const collisionKey = `${dateKey}|${parsedTime.startTime}`;
      if (existingKeySet.has(collisionKey)) {
        continue;
      }

      generatedSessions.push({
        batchId: batch._id,
        level: batch.level,
        topic: topicCounter,
        date: sessionDate,
        startTime: parsedTime.startTime,
        endTime: parsedTime.endTime,
        meetLink: batch.meetLink,
        status: "Scheduled"
      });

      existingKeySet.add(collisionKey);
      topicCounter += 1;
    }

    if (generatedSessions.length === 0) {
      return res.status(400).json({
        message: "No new sessions generated. Dates may already be scheduled within the selected range."
      });
    }

    const inserted = await Session.insertMany(generatedSessions, { ordered: false });

    return res.status(201).json({
      message: `${inserted.length} sessions generated successfully.`,
      sessions: inserted
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Duplicate session conflict detected." });
    }
    return res.status(500).json({ message: "Unable to generate sessions right now." });
  }
};

const getSessions = async (req, res) => {
  try {
    const { batchId, status } = req.query || {};
    const filter = {};

    if (batchId) {
      if (!mongoose.isValidObjectId(String(batchId))) {
        return res.status(400).json({ message: "Invalid batch id filter." });
      }
      filter.batchId = String(batchId);
    }

    if (status) {
      const normalizedStatus = String(status).trim();
      if (!VALID_STATUSES.has(normalizedStatus)) {
        return res.status(400).json({ message: "Invalid session status filter." });
      }
      filter.status = normalizedStatus;
    }

    const sessions = await Session.find(filter)
      .sort({ date: 1, startTime: 1 })
      .populate("batchId", "_id name level timezone")
      .lean();

    return res.json({ sessions });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load sessions right now." });
  }
};

const updateSessionStatus = async (req, res, status) => {
  const { sessionId } = req.params;
  if (!mongoose.isValidObjectId(sessionId)) {
    return res.status(400).json({ message: "Invalid session id." });
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    return res.status(404).json({ message: "Session not found." });
  }

  session.status = status;
  await session.save();

  return res.json({ message: `Session marked ${status.toLowerCase()}.`, session });
};

const markSessionCompleted = async (req, res) => {
  try {
    return await updateSessionStatus(req, res, "Completed");
  } catch (_error) {
    return res.status(500).json({ message: "Unable to update session right now." });
  }
};

const cancelSession = async (req, res) => {
  try {
    return await updateSessionStatus(req, res, "Cancelled");
  } catch (_error) {
    return res.status(500).json({ message: "Unable to update session right now." });
  }
};

const rescheduleSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { date, startTime, endTime, meetLink } = req.body || {};

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ message: "Invalid session id." });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    const parsedDate = new Date(date);
    if (!date || Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Valid date is required." });
    }

    const normalizedStartTime = String(startTime || "").trim();
    const normalizedEndTime = String(endTime || "").trim();
    if (!normalizedStartTime || !normalizedEndTime) {
      return res.status(400).json({ message: "Start and end time are required." });
    }

    const normalizedMeetLink = parseUrl(meetLink || session.meetLink);
    if (!normalizedMeetLink) {
      return res.status(400).json({ message: "Valid Meet link is required." });
    }

    const dayDate = startOfDay(parsedDate);

    const duplicate = await Session.findOne({
      _id: { $ne: session._id },
      batchId: session.batchId,
      date: dayDate,
      startTime: normalizedStartTime
    })
      .select("_id")
      .lean();

    if (duplicate) {
      return res.status(409).json({ message: "Another session is already scheduled at that time." });
    }

    session.date = dayDate;
    session.startTime = normalizedStartTime;
    session.endTime = normalizedEndTime;
    session.meetLink = normalizedMeetLink;
    session.status = "Scheduled";
    await session.save();

    return res.json({ message: "Session rescheduled.", session });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to reschedule session right now." });
  }
};

const getBatchStudents = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!mongoose.isValidObjectId(batchId)) {
      return res.status(400).json({ message: "Invalid batch id." });
    }

    const batch = await Batch.findById(batchId).lean();
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    const students = await User.find({ batchId, role: "student" })
      .select("_id name email currentLevel currentTopic chessRating")
      .sort({ name: 1 })
      .lean();

    return res.json({ batch, students });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load batch students right now." });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!mongoose.isValidObjectId(batchId)) {
      return res.status(400).json({ message: "Invalid batch id." });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    // Clear batch reference from all students — students are NOT deleted.
    await User.updateMany({ batchId }, { $set: { batchId: null } });

    // Delete all sessions linked to this batch.
    const { deletedCount } = await Session.deleteMany({ batchId });

    // Delete the batch itself.
    await Batch.findByIdAndDelete(batchId);

    return res.json({
      message: "Batch deleted successfully.",
      deletedSessions: deletedCount
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to delete batch right now." });
  }
};

const removeStudentFromBatch = async (req, res) => {
  try {
    const { batchId, studentId } = req.params;

    if (!mongoose.isValidObjectId(batchId) || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid batch or student id." });
    }

    const batch = await Batch.findById(batchId).lean();
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Only clear if this student actually belongs to this batch.
    if (student.batchId && String(student.batchId) === String(batchId)) {
      student.batchId = null;
      await student.save();
    }

    return res.json({ message: "Student removed from batch." });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to remove student right now." });
  }
};

const getWeeklyTimetable = async (_req, res) => {
  try {
    const batches = await Batch.find({}).lean();

    // Count students per batch via aggregation
    const studentCounts = await User.aggregate([
      { $match: { role: "student", batchId: { $ne: null } } },
      { $group: { _id: "$batchId", count: { $sum: 1 } } }
    ]);
    const countMap = {};
    studentCounts.forEach(({ _id, count }) => {
      countMap[String(_id)] = count;
    });

    const slots = [];

    for (const batch of batches) {
      if (!Array.isArray(batch.days) || batch.days.length === 0) {
        continue;
      }

      const parsed = parseTimeRange(batch.time);
      const startTime = parsed ? parsed.startTime : batch.time;
      const endTime = parsed ? parsed.endTime : "";

      for (const day of batch.days) {
        if (!VALID_DAYS.has(day)) {
          continue;
        }

        slots.push({
          day,
          startTime,
          endTime,
          batchId: String(batch._id),
          batchName: batch.name,
          levelName: batch.level,
          meetingLink: batch.meetLink,
          timezone: batch.timezone,
          time: batch.time,
          studentCount: countMap[String(batch._id)] || 0
        });
      }
    }

    // Sort by day-of-week index then by start time (24h numeric)
    const DAY_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

    slots.sort((a, b) => {
      const dayDiff = (DAY_INDEX[a.day] ?? 7) - (DAY_INDEX[b.day] ?? 7);
      if (dayDiff !== 0) {
        return dayDiff;
      }
      const aPoint = parseTimePoint(a.startTime);
      const bPoint = parseTimePoint(b.startTime);
      if (!aPoint || !bPoint) {
        return 0;
      }
      return to24Hour(aPoint) - to24Hour(bPoint);
    });

    return res.json({ slots });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load weekly timetable." });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchStudents,
  getStudentsForBatchAssignment,
  assignStudentsToBatch,
  generateSessions,
  getSessions,
  markSessionCompleted,
  cancelSession,
  rescheduleSession,
  deleteBatch,
  removeStudentFromBatch,
  getWeeklyTimetable
};
