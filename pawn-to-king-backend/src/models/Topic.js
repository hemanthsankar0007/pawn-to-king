const mongoose = require("mongoose");
const { LEVEL_NAMES } = require("../utils/constants");

const homeworkQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["mcq", "text"],
      required: true
    },
    options: {
      type: [String],
      default: []
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    levelName: {
      type: String,
      enum: LEVEL_NAMES,
      required: true
    },
    orderNumber: {
      type: Number,
      required: true,
      min: 1
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    homeworkLink: {
      type: String,
      default: null,
      trim: true
    },
    homeworkQuestions: {
      type: [homeworkQuestionSchema],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one homework question is required."
      }
    }
  },
  { timestamps: true }
);

topicSchema.index({ levelName: 1, orderNumber: 1 }, { unique: true });

module.exports = mongoose.model("Topic", topicSchema);

