import { useState } from "react";
import { Link } from "react-router-dom";
import { submitJoinApplication } from "../api/apiService";
import StatusMessage from "./StatusMessage";

const initialForm = {
  fullName: "",
  age: "",
  chessComRating: "",
  fideRating: "",
  countryCode: "+91",
  phoneNumber: "",
  email: "",
  preferredDays: [],
  timeZone: "IST (UTC+5:30)"
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{6,15}$/;
const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const COUNTRY_OPTIONS = [
  { label: "India (+91)", value: "+91" },
  { label: "United States (+1)", value: "+1" },
  { label: "United Kingdom (+44)", value: "+44" },
  { label: "Australia (+61)", value: "+61" },
  { label: "Canada (+1)", value: "+1" },
  { label: "Singapore (+65)", value: "+65" },
  { label: "UAE (+971)", value: "+971" }
];
const TIME_ZONE_OPTIONS = [
  "IST (UTC+5:30)",
  "GMT (UTC+0)",
  "EST (UTC-5)",
  "PST (UTC-8)",
  "SGT (UTC+8)",
  "AEST (UTC+10)"
];

function ApplicationForm({
  onSubmitted,
  showLoginLink = true,
  submitLabel = "Submit Application",
  className = ""
}) {
  const [form, setForm] = useState(initialForm);
  const [timeSlots, setTimeSlots] = useState([{ hour: "5", minute: "00", period: "PM" }]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const calculateEndTime = (hour, minute, period) => {
    let h = parseInt(hour, 10);
    let m = parseInt(minute, 10);

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    let totalMinutes = h * 60 + m + 45;

    let endHour = Math.floor(totalMinutes / 60) % 24;
    let endMinute = totalMinutes % 60;

    let endPeriod = endHour >= 12 ? "PM" : "AM";
    if (endHour > 12) endHour -= 12;
    if (endHour === 0) endHour = 12;

    return `${endHour}:${endMinute.toString().padStart(2, "0")} ${endPeriod}`;
  };

  const addTimeSlot = () => {
    setTimeSlots((previous) => [...previous, { hour: "5", minute: "00", period: "PM" }]);
  };

  const removeTimeSlot = (index) => {
    setTimeSlots((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateTimeSlot = (index, field, value) => {
    setTimeSlots((previous) =>
      previous.map((slot, currentIndex) =>
        currentIndex === index
          ? {
              ...slot,
              [field]: value
            }
          : slot
      )
    );
  };

  const validate = () => {
    const nextErrors = {};
    const age = Number(form.age);
    const chessComRating = form.chessComRating === "" ? null : Number(form.chessComRating);
    const fideRating = form.fideRating === "" ? null : Number(form.fideRating);

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required";
    }

    if (!Number.isInteger(age) || age < 4 || age > 100) {
      nextErrors.age = "Age must be between 4 and 100";
    }

    const normalizedPhone = form.phoneNumber.trim().replace(/[^\d]/g, "");
    if (!normalizedPhone || !PHONE_REGEX.test(normalizedPhone)) {
      nextErrors.phoneNumber = "Phone number is required";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Parent email is required";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email";
    }

    if (!form.preferredDays.length) {
      nextErrors.preferredDays = "Select at least one preferred day";
    }

    if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
      nextErrors.preferredTimeSlots = "At least one preferred time slot is required";
    }

    if (!form.timeZone) {
      nextErrors.timeZone = "Time zone is required";
    }

    if (chessComRating !== null && (!Number.isFinite(chessComRating) || chessComRating < 0)) {
      nextErrors.chessComRating = "Enter a valid Chess.com rating";
    }

    if (fideRating !== null && (!Number.isFinite(fideRating) || fideRating < 0)) {
      nextErrors.fideRating = "Enter a valid FIDE rating";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const togglePreferredDay = (day) => {
    setForm((previous) => {
      const exists = previous.preferredDays.includes(day);
      return {
        ...previous,
        preferredDays: exists
          ? previous.preferredDays.filter((item) => item !== day)
          : [...previous.preferredDays, day]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      const normalizedPhone = form.phoneNumber.trim().replace(/[^\d]/g, "");
      const fullPhone = `${form.countryCode}${normalizedPhone}`;
      const formattedSlots = timeSlots.map((slot) => ({
        start: `${slot.hour}:${slot.minute} ${slot.period}`,
        end: calculateEndTime(slot.hour, slot.minute, slot.period)
      }));

      const response = await submitJoinApplication({
        fullName: form.fullName.trim(),
        age: Number(form.age),
        chessComRating: form.chessComRating === "" ? null : Number(form.chessComRating),
        fideRating: form.fideRating === "" ? null : Number(form.fideRating),
        countryCode: form.countryCode,
        phoneNumber: normalizedPhone,
        fullPhone,
        phone: fullPhone,
        email: form.email.trim(),
        preferredDays: form.preferredDays,
        preferredTimeSlots: formattedSlots,
        timeZone: form.timeZone
      });

      setForm(initialForm);
      setTimeSlots([{ hour: "5", minute: "00", period: "PM" }]);
      setFieldErrors({});

      onSubmitted?.({
        assignedLevel: response?.assignedLevel || "Pawn",
        placementMessage: response?.placementMessage || ""
      });
    } catch (error) {
      if (!error?.response) {
        setServerError("Cannot connect to server. Ensure backend is running on http://localhost:5000.");
      } else {
        setServerError(error?.response?.data?.message || "Unable to submit application right now.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={className}>
      {/* Header */}
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Join the Academy</p>
      <h1 className="mt-3 font-display text-[clamp(2rem,3.2vw,3rem)] uppercase tracking-[0.06em] text-gold">
        Student Application
      </h1>
      <p className="mt-2 text-sm text-text/60">Fill in your details below. We'll place you in the right level.</p>

      <form className="mt-10 space-y-10" onSubmit={handleSubmit}>

        {/* ── Section 1: Personal Details ── */}
        <div>
          <div className="mb-6 border-b border-gold/25 pb-3">
            <p className="text-lg font-semibold tracking-wide text-gold">Personal Details</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium tracking-wide text-text/75">
                Full Name <span className="text-gold">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-xl border border-gold/20 bg-white/5 px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-text/30"
                placeholder="Your full name"
              />
              {fieldErrors.fullName ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.fullName}</p> : null}
            </div>

            <div>
              <label htmlFor="age" className="mb-2 block text-sm font-medium tracking-wide text-text/75">
                Age <span className="text-gold">*</span>
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="4"
                max="100"
                value={form.age}
                onChange={handleChange}
                className="w-full rounded-xl border border-gold/20 bg-white/5 px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-text/30"
                placeholder="Your age"
              />
              {fieldErrors.age ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.age}</p> : null}
            </div>
          </div>
        </div>

        {/* ── Section 2: Ratings & Contact ── */}
        <div>
          <div className="mb-6 border-b border-gold/25 pb-3">
            <p className="text-lg font-semibold tracking-wide text-gold">Ratings & Contact</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="chessComRating" className="mb-2 block text-sm font-medium tracking-wide text-text/75">
                Chess.com Rating
                <span className="ml-2 text-xs text-text/40 font-normal">(Optional)</span>
              </label>
              <input
                id="chessComRating"
                name="chessComRating"
                type="number"
                min="0"
                value={form.chessComRating}
                onChange={handleChange}
                className="w-full rounded-xl border border-gold/20 bg-white/5 px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-text/30"
                placeholder="e.g. 1150"
              />
              {fieldErrors.chessComRating ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.chessComRating}</p> : null}
            </div>

            <div>
              <label htmlFor="fideRating" className="mb-2 block text-sm font-medium tracking-wide text-text/75">
                FIDE Rating
                <span className="ml-2 text-xs text-text/40 font-normal">(Optional)</span>
              </label>
              <input
                id="fideRating"
                name="fideRating"
                type="number"
                min="0"
                value={form.fideRating}
                onChange={handleChange}
                className="w-full rounded-xl border border-gold/20 bg-white/5 px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-text/30"
                placeholder="e.g. 1205"
              />
              {fieldErrors.fideRating ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.fideRating}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium tracking-wide text-text/75">
                Phone Number <span className="text-gold">*</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
                <select
                  id="countryCode"
                  name="countryCode"
                  value={form.countryCode}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gold/20 bg-white/5 px-4 py-3.5 text-sm text-text outline-none transition-all duration-200 focus:border-gold focus:ring-2 focus:ring-gold/20"
                >
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={`${option.label}-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gold/20 bg-white/5 px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-text/30"
                  placeholder="Enter phone number"
                />
              </div>
              {fieldErrors.phoneNumber ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.phoneNumber}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="email" className="mb-2 block text-sm font-medium tracking-wide text-text/75">
                Parent Email <span className="text-gold">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-gold/20 bg-white/5 px-4 py-3.5 text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-text/30"
                placeholder="you@example.com"
              />
              <p className="mt-1.5 text-xs text-text/40">Required for communication regarding classes.</p>
              {fieldErrors.email ? <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p> : null}
            </div>
          </div>
        </div>

        {/* ── Section 3: Preferred Schedule ── */}
        <div>
          <div className="mb-6 border-b border-gold/25 pb-3">
            <p className="text-lg font-semibold tracking-wide text-gold">Preferred Schedule</p>
          </div>

          {/* Days */}
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium tracking-wide text-text/75">
              Preferred Days <span className="text-gold">*</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {DAY_OPTIONS.map((day) => (
                <label
                  key={day}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    form.preferredDays.includes(day)
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-gold/20 bg-white/3 text-text/70 hover:border-gold/50 hover:bg-gold/8 hover:text-text"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.preferredDays.includes(day)}
                    onChange={() => togglePreferredDay(day)}
                    className="sr-only"
                  />
                  {day}
                </label>
              ))}
            </div>
            {fieldErrors.preferredDays ? <p className="mt-2 text-xs text-red-400">{fieldErrors.preferredDays}</p> : null}
          </div>

          {/* Time Slots */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium tracking-wide text-text/75">
              Preferred Time Slots <span className="text-gold">*</span>
              <span className="ml-2 text-xs text-text/40 font-normal">(45 mins each)</span>
            </p>

            <div className="space-y-3">
              {timeSlots.map((slot, index) => (
                <div
                  key={`${slot.hour}-${slot.minute}-${slot.period}-${index}`}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-gold/15 bg-white/4 px-5 py-4"
                >
                  <select
                    value={slot.hour}
                    onChange={(event) => updateTimeSlot(index, "hour", event.target.value)}
                    className="rounded-lg border border-gold/20 bg-bg/70 px-3 py-2 text-sm text-text outline-none transition focus:border-gold"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hourValue) => (
                      <option key={hourValue} value={String(hourValue)}>{hourValue}</option>
                    ))}
                  </select>

                  <select
                    value={slot.minute}
                    onChange={(event) => updateTimeSlot(index, "minute", event.target.value)}
                    className="rounded-lg border border-gold/20 bg-bg/70 px-3 py-2 text-sm text-text outline-none transition focus:border-gold"
                  >
                    <option value="00">00</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                    <option value="45">45</option>
                  </select>

                  <select
                    value={slot.period}
                    onChange={(event) => updateTimeSlot(index, "period", event.target.value)}
                    className="rounded-lg border border-gold/20 bg-bg/70 px-3 py-2 text-sm text-text outline-none transition focus:border-gold"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>

                  <span className="text-sm text-gold/80">
                    → {calculateEndTime(slot.hour, slot.minute, slot.period)}
                  </span>

                  {timeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      aria-label={`Remove slot ${index + 1}`}
                      className="ml-auto text-xs text-text/30 hover:text-red-400 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {fieldErrors.preferredTimeSlots ? <p className="mt-2 text-xs text-red-400">{fieldErrors.preferredTimeSlots}</p> : null}

            <button
              type="button"
              onClick={addTimeSlot}
              className="mt-4 w-full rounded-xl border border-dashed border-gold/40 py-3 text-sm font-medium text-gold/70 transition-all duration-200 hover:border-gold hover:bg-gold/8 hover:text-gold"
            >
              + Add Another Time Slot
            </button>
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timeZone" className="mb-2 block text-sm font-medium tracking-wide text-text/75">
              Time Zone <span className="text-gold">*</span>
            </label>
            <select
              id="timeZone"
              name="timeZone"
              value={form.timeZone}
              onChange={handleChange}
              className="w-full rounded-xl border border-gold/20 bg-white/5 px-4 py-3.5 text-sm text-text outline-none transition-all duration-200 focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              {TIME_ZONE_OPTIONS.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
            {fieldErrors.timeZone ? <p className="mt-1.5 text-xs text-red-400">{fieldErrors.timeZone}</p> : null}
          </div>
        </div>

        {/* ── Submit ── */}
        <div>
          <StatusMessage type="error" text={serverError} />
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-xl border border-gold bg-gold/10 py-4 text-base font-semibold text-gold shadow-lg transition-all duration-200 hover:scale-[1.02] hover:border-gold-hover hover:bg-gold/18 hover:text-gold-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? "Submitting application..." : submitLabel}
          </button>
        </div>
      </form>

      {showLoginLink ? (
        <p className="mt-6 text-sm text-text/60">
          Already have an account?{" "}
          <Link to="/login" className="text-gold hover:text-gold-hover">
            Login
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export default ApplicationForm;
