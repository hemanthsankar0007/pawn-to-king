const mongoose = require("mongoose");
const { LEVEL_NAMES } = require("../utils/constants");

const levelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: LEVEL_NAMES
    },
    meetingLink: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Level", levelSchema);

