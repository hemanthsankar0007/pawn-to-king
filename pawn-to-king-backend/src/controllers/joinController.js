const Application = require("../models/Application");
const User = require("../models/User");
const { calculatePlacementLevel, resolvePlacementRating } = require("../utils/levelPlacement");
const { normalizeEmail } = require("../utils/roleUtils");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_NUMBER_REGEX = /^\d{6,15}$/;
const COUNTRY_CODES = new Set(["+91", "+1", "+44", "+61", "+65", "+971"]);
const PREFERRED_DAYS = new Set([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]);
const TIME_ZONES = new Set([
  "IST (UTC+5:30)",
  "GMT (UTC+0)",
  "EST (UTC-5)",
  "PST (UTC-8)",
  "SGT (UTC+8)",
  "AEST (UTC+10)"
]);
const TIME_POINT_REGEX = /^(0?[1-9]|1[0-2]):(00|15|30|45) (AM|PM)$/;

const toOptionalNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const calculateEndTime = (hour, minute, period) => {
  let h = Number.parseInt(hour, 10);
  let m = Number.parseInt(minute, 10);

  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;

  let totalMinutes = h * 60 + m + 45;

  let endHour = Math.floor(totalMinutes / 60) % 24;
  let endMinute = totalMinutes % 60;

  let endPeriod = endHour >= 12 ? "PM" : "AM";
  if (endHour > 12) endHour -= 12;
  if (endHour === 0) endHour = 12;

  return `${endHour}:${String(endMinute).padStart(2, "0")} ${endPeriod}`;
};

const normalizePreferredTimeSlots = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((slot) => ({
      start: String(slot?.start || "").trim(),
      end: String(slot?.end || "").trim()
    }))
    .filter((slot) => slot.start && slot.end);
};

const submitApplication = async (req, res) => {
  try {
    const {
      fullName,
      age,
      chessComRating,
      fideRating,
      email,
      countryCode,
      phoneNumber,
      phone,
      preferredDays,
      preferredTimeSlots,
      timeZone
    } = req.body || {};

    const normalizedEmail = normalizeEmail(email);
    const trimmedName = String(fullName || "").trim();
    const trimmedCountryCode = String(countryCode || "").trim();
    const normalizedPhoneNumber = String(phoneNumber || phone || "")
      .trim()
      .replace(/[^\d]/g, "");
    const fullPhone = `${trimmedCountryCode}${normalizedPhoneNumber}`;
    const normalizedPreferredDays = Array.isArray(preferredDays)
      ? [...new Set(preferredDays.map((day) => String(day || "").trim()).filter(Boolean))]
      : [];
    const normalizedPreferredTimeSlots = normalizePreferredTimeSlots(preferredTimeSlots);
    const trimmedTimeZone = String(timeZone || "").trim();
    const parsedAge = Number(age);
    const parsedChessComRating = toOptionalNumber(chessComRating);
    const parsedFideRating = toOptionalNumber(fideRating);
    const errors = [];

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 80) {
      errors.push("Full Name must be between 2 and 80 characters.");
    }

    if (!Number.isInteger(parsedAge) || parsedAge < 4 || parsedAge > 100) {
      errors.push("Age must be a whole number between 4 and 100.");
    }

    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      errors.push("A valid email is required.");
    }

    if (!trimmedCountryCode || !COUNTRY_CODES.has(trimmedCountryCode)) {
      errors.push("Country code is invalid.");
    }

    if (!normalizedPhoneNumber || !PHONE_NUMBER_REGEX.test(normalizedPhoneNumber)) {
      errors.push("Phone Number is invalid.");
    }

    if (normalizedPreferredDays.length === 0) {
      errors.push("Preferred days are required.");
    } else if (normalizedPreferredDays.some((day) => !PREFERRED_DAYS.has(day))) {
      errors.push("Preferred days contain an invalid value.");
    }

    if (normalizedPreferredTimeSlots.length === 0) {
      errors.push("At least one preferred time slot is required.");
    } else {
      const hasInvalidStart = normalizedPreferredTimeSlots.some(
        (slot) => !TIME_POINT_REGEX.test(slot.start)
      );
      if (hasInvalidStart) {
        errors.push("Preferred time slot is invalid.");
      } else {
        const hasInvalidEnd = normalizedPreferredTimeSlots.some((slot) => {
          const [, hour, minute, period] = slot.start.match(TIME_POINT_REGEX) || [];
          if (!hour || !minute || !period) {
            return true;
          }
          const expectedEnd = calculateEndTime(hour, minute, period);
          return expectedEnd !== slot.end;
        });

        if (hasInvalidEnd) {
          errors.push("Preferred time slot end time is invalid.");
        }
      }
    }

    if (!trimmedTimeZone || !TIME_ZONES.has(trimmedTimeZone)) {
      errors.push("Time zone is invalid.");
    }

    if (
      (parsedChessComRating !== null &&
        (!Number.isFinite(parsedChessComRating) || parsedChessComRating < 0 || parsedChessComRating > 3500)) ||
      (parsedFideRating !== null &&
        (!Number.isFinite(parsedFideRating) || parsedFideRating < 0 || parsedFideRating > 3500))
    ) {
      errors.push("Ratings must be valid numbers between 0 and 3500.");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Please fix the highlighted inputs.",
        errors
      });
    }

    const [existingUser, existingPendingApplication] = await Promise.all([
      User.findOne({ email: normalizedEmail }).select("_id").lean(),
      Application.findOne({ email: normalizedEmail, status: "pending" }).select("_id").lean()
    ]);

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    if (existingPendingApplication) {
      return res
        .status(409)
        .json({ message: "You already have a pending application. Please wait for admin review." });
    }

    const ratingUsed = resolvePlacementRating({
      chessComRating: parsedChessComRating,
      fideRating: parsedFideRating
    });
    const placement = calculatePlacementLevel(ratingUsed);
    const primaryPreferredTimeSlot =
      normalizedPreferredTimeSlots.length > 0
        ? `${normalizedPreferredTimeSlots[0].start} - ${normalizedPreferredTimeSlots[0].end}`
        : "";

    const application = await Application.create({
      fullName: trimmedName,
      age: parsedAge,
      chessComRating: parsedChessComRating,
      fideRating: parsedFideRating,
      countryCode: trimmedCountryCode,
      phoneNumber: normalizedPhoneNumber,
      fullPhone,
      phone: fullPhone,
      preferredDays: normalizedPreferredDays,
      preferredTimeSlots: normalizedPreferredTimeSlots,
      preferredTimeSlot: primaryPreferredTimeSlot,
      timeZone: trimmedTimeZone,
      email: normalizedEmail,
      assignedLevel: placement.levelName,
      ratingUsed
    });

    return res.status(201).json({
      message: "Application submitted successfully.",
      applicationId: application._id,
      assignedLevel: placement.levelName,
      placementMessage: placement.message
    });
  } catch (_error) {
    return res.status(500).json({ message: "Unable to submit application right now please try again after some time." });
  }
};

module.exports = {
  submitApplication
};
