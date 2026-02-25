const mongoose = require("mongoose");
const { LEVEL_NAMES } = require("../utils/constants");

const sessionSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true
    },
    level: {
      type: String,
      required: true,
      enum: LEVEL_NAMES
    },
    topic: {
      type: Number,
      required: true,
      min: 1
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true,
      trim: true
    },
    endTime: {
      type: String,
      required: true,
      trim: true
    },
    meetLink: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled"
    },
    // Reserved for future attendance tracking per session.
    attendanceRecords: {
      type: [
        {
          studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          present: { type: Boolean, default: false }
        }
      ],
      default: []
    },
    // Reserved for future per-session homework mapping.
    homeworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      default: null
    },
    // Reserved for future multi-coach assignment.
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

sessionSchema.index({ batchId: 1, date: 1, startTime: 1 }, { unique: true });
sessionSchema.index({ batchId: 1, topic: 1 });

module.exports = mongoose.model("Session", sessionSchema);
