const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionIndex: {
      type: Number,
      required: true,
      min: 0
    },
    answer: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true
    },
    answers: {
      type: [answerSchema],
      default: []
    },
    score: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);

