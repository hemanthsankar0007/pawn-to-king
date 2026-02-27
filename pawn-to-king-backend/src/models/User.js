const mongoose = require("mongoose");
const { LEVEL_NAMES } = require("../utils/constants");
const { resolveRoleByEmail } = require("../utils/roleUtils");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    chessRating: {
      type: Number,
      default: 100,
      min: 0
    },
    age: {
      type: Number,
      min: 4,
      max: 100,
      default: null
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    currentLevel: {
      type: String,
      enum: LEVEL_NAMES,
      default: "Pawn"
    },
    currentTopic: {
      type: Number,
      default: 1,
      min: 1
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    mustChangePassword: {
      type: Boolean,
      default: false
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null
    },
    finalSchedule: {
      days: {
        type: [String],
        default: []
      },
      time: {
        type: String,
        default: ""
      },
      timezone: {
        type: String,
        default: ""
      }
    }
  },
  { timestamps: true }
);

userSchema.pre("validate", function setRoleFromEmail(next) {
  if (this.email) {
    this.email = String(this.email).trim().toLowerCase();
  }

  this.role = resolveRoleByEmail(this.email);

  if (!this.currentTopic || this.currentTopic < 1) {
    this.currentTopic = 1;
  }

  next();
});

userSchema.methods.toJSON = function toJSON() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
