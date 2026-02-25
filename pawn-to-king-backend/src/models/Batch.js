const mongoose = require("mongoose");
const { LEVEL_NAMES } = require("../utils/constants");

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    level: {
      type: String,
      required: true,
      enum: LEVEL_NAMES
    },
    days: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one day is required."
      }
    },
    time: {
      type: String,
      required: true,
      trim: true
    },
    timezone: {
      type: String,
      required: true,
      trim: true
    },
    meetLink: {
      type: String,
      required: true,
      trim: true
    },
    // Reserved for multiple coach support.
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

batchSchema.index({ level: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Batch", batchSchema);
