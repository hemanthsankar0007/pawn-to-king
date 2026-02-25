const mongoose = require("mongoose");
const { LEVEL_NAMES } = require("../utils/constants");

const curriculumTopicSchema = new mongoose.Schema(
  {
    levelName: {
      type: String,
      enum: LEVEL_NAMES,
      required: true
    },
    sectionName: {
      type: String,
      required: true,
      trim: true
    },
    orderNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 40
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true
    },
    difficultyLevel: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"]
    },
    estimatedDuration: {
      type: Number,
      required: true,
      min: 5
    },
    learningObjective: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

curriculumTopicSchema.index({ levelName: 1, orderNumber: 1 }, { unique: true });

module.exports = mongoose.model("CurriculumTopic", curriculumTopicSchema);
