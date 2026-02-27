const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { isValidObjectId } = require("mongoose");
const Application = require("../models/Application");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { LEVEL_NAMES, MAX_TOPICS_PER_LEVEL } = require("../utils/constants");

const progressFromTopic = (currentTopic) => {
  const completedTopics = Math.max(0, Number(currentTopic) - 1);
  return Math.max(
    0,
    Math.min(100, Math.round((completedTopics / Number(MAX_TOPICS_PER_LEVEL)) * 100))
  );
};

const buildStudentPayload = (student) => ({
  _id: student._id,
  name: student.name,
  email: student.email,
  age: student.age,
  phone: student.phone,
  chessRating: student.chessRating,
  currentLevel: student.currentLevel,
  currentTopic: student.currentTopic,
  mustChangePassword: Boolean(student.mustChangePassword),
  progressPercentage: progressFromTopic(student.currentTopic),
  batchId: student.batchId || null,
  finalSchedule: student.finalSchedule || { days: [], time: "", timezone: "" },
  createdAt: student.createdAt,
  updatedAt: student.updatedAt
});

const createTemporaryPassword = (length = 12) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  const bytes = crypto.randomBytes(length);
  let output = "";

  for (let index = 0; index < length; index += 1) {
    output += chars[bytes[index] % chars.length];
  }

  return output;
};

const getApplications = async (req, res) => {
  try {
    const status = String(req.query.status || "pending").toLowerCase();
    const allowedStatuses = new Set(["pending", "approved", "rejected"]);
    const resolvedStatus = allowedStatuses.has(status) ? status : "pending";

    const applications = await Application.find({ status: resolvedStatus })
      .sort({ createdAt: 1 })
      .select(
        "_id fullName age email phone chessComRating fideRating ratingUsed assignedLevel status createdAt processedAt rejectionReason preferredDays preferredTimeSlots timeZone"
      )
      .lean();

    return res.json({ applications });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load applications right now." });
  }
};

const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { level, batchId, finalDays, finalTime, finalTimezone } = req.body || {};

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ message: "Only pending applications can be approved." });
    }

    const existingUser = await User.findOne({ email: application.email }).select("_id");
    if (existingUser) {
      return res.status(409).json({ message: "A user account for this email already exists." });
    }

    // Use admin-confirmed level or fall back to auto-assigned level
    const confirmedLevel =
      level && LEVEL_NAMES.includes(level) ? level : application.assignedLevel;

    // Normalize confirmed days
    const confirmedDays = Array.isArray(finalDays)
      ? finalDays.map((d) => String(d).trim()).filter(Boolean)
      : typeof finalDays === "string"
        ? finalDays.split(",").map((d) => d.trim()).filter(Boolean)
        : application.preferredDays || [];

    const confirmedTime = String(finalTime || "").trim();
    const confirmedTimezone = String(finalTimezone || application.timeZone || "").trim();
    const confirmedBatchId = batchId || null;

    const temporaryPassword = createTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    const createdUser = await User.create({
      name: application.fullName,
      email: application.email,
      password: hashedPassword,
      age: application.age,
      phone: application.phone,
      chessRating: application.ratingUsed,
      currentLevel: confirmedLevel,
      currentTopic: 1,
      mustChangePassword: true,
      batchId: confirmedBatchId,
      finalSchedule: {
        days: confirmedDays,
        time: confirmedTime,
        timezone: confirmedTimezone
      }
    });

    application.status = "approved";
    application.processedBy = req.user.userId;
    application.processedAt = new Date();
    application.approvedUserId = createdUser._id;
    application.rejectionReason = "";
    await application.save();

    console.log(
      `[EMAIL_PLACEHOLDER] To: ${createdUser.email} | Temp Password: ${temporaryPassword} | Level: ${confirmedLevel} | Final Days: ${confirmedDays.join(", ")} | Final Time: ${confirmedTime} | Timezone: ${confirmedTimezone} | Phone: ${application.fullPhone || application.phone || "N/A"}`
    );

    return res.json({
      message: "Application approved and student account created.",
      temporaryPassword,
      user: buildStudentPayload(createdUser)
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to approve this application right now." });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const rejectionReason = String(req.body?.reason || "").trim();
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (application.status !== "pending") {
      return res.status(400).json({ message: "Only pending applications can be rejected." });
    }

    application.status = "rejected";
    application.processedBy = req.user.userId;
    application.processedAt = new Date();
    application.rejectionReason = rejectionReason;
    await application.save();

    return res.json({ message: "Application rejected." });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to reject this application right now." });
  }
};

const getStudents = async (req, res) => {
  try {
    const requestedLevel = String(req.query.level || "").trim();
    const filter = { role: "student" };

    if (requestedLevel && requestedLevel !== "All") {
      if (!LEVEL_NAMES.includes(requestedLevel)) {
        return res.status(400).json({ message: "Invalid level filter." });
      }
      filter.currentLevel = requestedLevel;
    }

    const students = await User.find(filter)
      .sort({ currentLevel: 1, name: 1 })
      .select("_id name email age phone chessRating currentLevel currentTopic role batchId finalSchedule createdAt updatedAt")
      .lean();

    return res.json({
      students: students.map((student) => ({
        ...student,
        progressPercentage: progressFromTopic(student.currentTopic)
      }))
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to load students right now." });
  }
};

const updateStudentLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const level = String(req.body?.level || "").trim();

    if (!LEVEL_NAMES.includes(level)) {
      return res.status(400).json({ message: "Invalid level." });
    }

    const student = await User.findOne({ _id: id, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    student.currentLevel = level;
    student.currentTopic = 1;
    await student.save();

    return res.json({
      message: "Student level updated.",
      student: buildStudentPayload(student)
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to update student level right now." });
  }
};

const unlockNextLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ _id: id, role: "student" });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const currentIndex = LEVEL_NAMES.findIndex((levelName) => levelName === student.currentLevel);
    if (currentIndex < 0 || currentIndex >= LEVEL_NAMES.length - 1) {
      return res.status(400).json({ message: "Student is already at the highest level." });
    }

    student.currentLevel = LEVEL_NAMES[currentIndex + 1];
    student.currentTopic = 1;
    await student.save();

    return res.json({
      message: "Next level unlocked.",
      student: buildStudentPayload(student)
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to unlock next level right now." });
  }
};

const updateStudentTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = Number(req.body?.currentTopic);

    if (!Number.isInteger(topic) || topic < 1 || topic > MAX_TOPICS_PER_LEVEL) {
      return res
        .status(400)
        .json({ message: `Current topic must be between 1 and ${MAX_TOPICS_PER_LEVEL}.` });
    }

    const student = await User.findOne({ _id: id, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    student.currentTopic = topic;
    await student.save();

    return res.json({
      message: "Student topic updated.",
      student: buildStudentPayload(student)
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to update student topic right now." });
  }
};

const resetStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findOne({ _id: id, role: "student" }).select("+password");

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const temporaryPassword = createTemporaryPassword();
    student.password = await bcrypt.hash(temporaryPassword, 12);
    student.mustChangePassword = true;
    await student.save();

    console.log(
      `[EMAIL_PLACEHOLDER] Password reset email to ${student.email} with temporary password: ${temporaryPassword}`
    );

    return res.json({
      message: "Temporary password generated and email placeholder logged.",
      temporaryPassword
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to reset password right now." });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid student id." });
    }

    const student = await User.findOne({ _id: id, role: "student" }).select("_id name email");
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    await Promise.all([
      Submission.deleteMany({ userId: student._id }),
      Application.updateMany(
        { approvedUserId: student._id },
        { $set: { approvedUserId: null } }
      ),
      User.deleteOne({ _id: student._id, role: "student" })
    ]);

    return res.json({
      message: "Student deleted successfully.",
      deletedStudent: {
        _id: student._id,
        name: student.name,
        email: student.email
      }
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to delete student right now." });
  }
};

module.exports = {
  getApplications,
  approveApplication,
  rejectApplication,
  getStudents,
  updateStudentLevel,
  unlockNextLevel,
  updateStudentTopic,
  resetStudentPassword,
  deleteStudent
};
