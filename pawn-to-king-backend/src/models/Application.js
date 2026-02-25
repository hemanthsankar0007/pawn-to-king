const mongoose = require("mongoose");
const { LEVEL_NAMES } = require("../utils/constants");

const applicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    age: {
      type: Number,
      required: true,
      min: 4,
      max: 100
    },
    chessComRating: {
      type: Number,
      min: 0,
      default: null
    },
    fideRating: {
      type: Number,
      min: 0,
      default: null
    },
    countryCode: {
      type: String,
      required: function requireCountryCode() {
        return this.isNew;
      },
      trim: true
    },
    phoneNumber: {
      type: String,
      required: function requirePhoneNumber() {
        return this.isNew;
      },
      trim: true,
      minlength: 6,
      maxlength: 20
    },
    fullPhone: {
      type: String,
      required: function requireFullPhone() {
        return this.isNew;
      },
      trim: true,
      minlength: 7,
      maxlength: 24
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      maxlength: 20
    },
    preferredDays: {
      type: [String],
      required: function requirePreferredDays() {
        return this.isNew;
      },
      validate: {
        validator: function validatePreferredDays(value) {
          if (!this.isNew && (!Array.isArray(value) || value.length === 0)) {
            return true;
          }
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one preferred day is required."
      }
    },
    preferredTimeSlots: {
      type: [
        {
          start: {
            type: String,
            required: true,
            trim: true
          },
          end: {
            type: String,
            required: true,
            trim: true
          }
        }
      ],
      required: function requirePreferredTimeSlots() {
        return this.isNew;
      },
      validate: {
        validator: function validatePreferredTimeSlots(value) {
          if (!this.isNew && (!Array.isArray(value) || value.length === 0)) {
            return true;
          }
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one preferred time slot is required."
      }
    },
    preferredTimeSlot: {
      type: String,
      default: "",
      trim: true
    },
    timeZone: {
      type: String,
      required: function requireTimeZone() {
        return this.isNew;
      },
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    assignedLevel: {
      type: String,
      required: true,
      enum: LEVEL_NAMES
    },
    ratingUsed: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    processedAt: {
      type: Date,
      default: null
    },
    approvedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

applicationSchema.index({ email: 1, status: 1 });

applicationSchema.pre("validate", function normalizeApplication(next) {
  if (this.email) {
    this.email = String(this.email).trim().toLowerCase();
  }

  if (this.phone) {
    this.phone = String(this.phone).trim();
  }

  if (this.countryCode) {
    this.countryCode = String(this.countryCode).trim();
  }

  if (this.phoneNumber) {
    this.phoneNumber = String(this.phoneNumber).trim();
  }

  if (this.fullPhone) {
    this.fullPhone = String(this.fullPhone).trim();
  }

  if (this.preferredTimeSlot) {
    this.preferredTimeSlot = String(this.preferredTimeSlot).trim();
  }

  if (Array.isArray(this.preferredTimeSlots)) {
    this.preferredTimeSlots = this.preferredTimeSlots
      .map((slot) => ({
        start: String(slot?.start || "").trim(),
        end: String(slot?.end || "").trim()
      }))
      .filter((slot) => slot.start && slot.end);
  }

  if (!this.preferredTimeSlot && Array.isArray(this.preferredTimeSlots) && this.preferredTimeSlots.length > 0) {
    const firstSlot = this.preferredTimeSlots[0];
    this.preferredTimeSlot = `${firstSlot.start} - ${firstSlot.end}`;
  }

  if (this.timeZone) {
    this.timeZone = String(this.timeZone).trim();
  }

  if (Array.isArray(this.preferredDays)) {
    this.preferredDays = this.preferredDays
      .map((day) => String(day || "").trim())
      .filter(Boolean);
  }

  next();
});

module.exports = mongoose.model("Application", applicationSchema);
