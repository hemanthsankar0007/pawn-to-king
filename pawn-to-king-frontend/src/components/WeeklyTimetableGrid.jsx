import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Convert "6:00 PM" → total minutes (for sorting)
const timeToMinutes = (timeStr) => {
  const match = String(timeStr || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const p = match[3].toUpperCase();
  if (p === "PM" && h !== 12) h += 12;
  if (p === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const LEVEL_COLORS = {
  Pawn: "from-amber-500/20 to-amber-600/10 border-amber-400/40 text-amber-300",
  "Pawn+": "from-amber-400/25 to-amber-500/10 border-amber-300/50 text-amber-200",
  Knight: "from-sky-500/20 to-sky-600/10 border-sky-400/40 text-sky-300",
  Bishop: "from-violet-500/20 to-violet-600/10 border-violet-400/40 text-violet-300",
  Rook: "from-emerald-500/20 to-emerald-600/10 border-emerald-400/40 text-emerald-300",
  Queen: "from-rose-500/20 to-rose-600/10 border-rose-400/40 text-rose-300",
};

const getLevelColors = (level) =>
  LEVEL_COLORS[level] || "from-gold/15 to-gold/5 border-gold/35 text-gold";

// Skeleton shimmer for loading state
function GridSkeleton() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gold/15 bg-[rgba(255,255,255,0.02)]">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gold/15">
            <th className="w-28 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.15em] text-gold">
              Time
            </th>
            {DAYS.map((d) => (
              <th key={d} className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-[0.15em] text-gold/70">
                {d.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-t border-gold/8">
              <td className="px-4 py-3">
                <div className="h-4 w-16 animate-pulse rounded bg-gold/10" />
              </td>
              {DAYS.map((d) => (
                <td key={d} className="px-3 py-3">
                  {Math.random() > 0.7 ? (
                    <div className="h-16 animate-pulse rounded-lg bg-gold/8" />
                  ) : (
                    <div className="h-16" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Detail modal shown when a batch cell is clicked
function SlotDetailModal({ slot, onClose }) {
  if (!slot) return null;

  const levelColors = getLevelColors(slot.levelName);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-md rounded-2xl border border-gold/25 bg-[#12120e] p-7 shadow-[0_0_60px_rgba(0,0,0,0.7)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Level badge */}
          <span
            className={`inline-flex items-center rounded-full border bg-gradient-to-r px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${levelColors}`}
          >
            {slot.levelName}
          </span>

          <h2 className="mt-3 font-display text-2xl text-text">{slot.batchName}</h2>

          <div className="mt-5 space-y-3 text-sm">
            <Row label="Day" value={slot.day} />
            <Row label="Time" value={`${slot.startTime} – ${slot.endTime}`} />
            <Row label="Timezone" value={slot.timezone} />
            <Row label="Students" value={String(slot.studentCount ?? "—")} />
            <div className="flex items-start gap-3 border-t border-gold/10 pt-3">
              <span className="mt-0.5 w-24 shrink-0 text-xs uppercase tracking-[0.12em] text-text/50">Meet Link</span>
              <a
                href={slot.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-gold underline underline-offset-2 transition-opacity hover:opacity-80"
              >
                {slot.meetingLink}
              </a>
            </div>
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <a
              href={slot.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold to-amber-400 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#0a0a08] shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
            >
              <VideoIcon /> Join Meeting
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gold/20 px-5 py-2.5 text-xs font-semibold text-text/70 transition-all duration-150 hover:border-gold/40 hover:text-text"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start gap-3 border-t border-gold/8 pt-3 first:border-t-0 first:pt-0">
      <span className="w-24 shrink-0 text-xs uppercase tracking-[0.12em] text-text/50">{label}</span>
      <span className="text-text/90">{value}</span>
    </div>
  );
}

function VideoIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="h-3 w-3 shrink-0 opacity-70" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
    </svg>
  );
}

// Main exported component
export default function WeeklyTimetableGrid({ slots = [], loading = false }) {
  const [activeSlot, setActiveSlot] = useState(null);

  // Build lookup map: "Monday-6:00 PM" → [slot, ...]
  const sessionMap = useMemo(() => {
    const map = {};
    slots.forEach((slot) => {
      const key = `${slot.day}-${slot.startTime}`;
      if (!map[key]) map[key] = [];
      map[key].push(slot);
    });
    return map;
  }, [slots]);

  // Unique time rows sorted chronologically
  const timeRows = useMemo(() => {
    const times = new Set(slots.map((s) => s.startTime));
    return [...times].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  }, [slots]);

  if (loading) {
    return <GridSkeleton />;
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/15 bg-[rgba(255,255,255,0.02)] py-16 text-center">
        <div className="mb-3 text-4xl opacity-30">📅</div>
        <p className="text-sm text-text/50">No sessions scheduled yet.</p>
        <p className="mt-1 text-xs text-text/35">Create a batch with days to see it here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-gold/15 bg-[rgba(255,255,255,0.02)]">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gold/15">
              {/* Time column header */}
              <th className="sticky left-0 z-10 w-28 bg-[#0f0f0c] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                Time
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="min-w-[9rem] px-3 py-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-gold/75"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 3)}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {timeRows.map((time, rowIdx) => (
              <tr
                key={time}
                className={`border-t border-gold/8 transition-colors duration-150 hover:bg-gold/[0.025] ${
                  rowIdx % 2 === 0 ? "" : "bg-white/[0.01]"
                }`}
              >
                {/* Time label — sticky on scroll */}
                <td className="sticky left-0 z-10 bg-[#0f0f0c] px-5 py-3 align-top text-xs font-semibold tabular-nums text-text/60">
                  {time}
                </td>

                {DAYS.map((day) => {
                  const cellSlots = sessionMap[`${day}-${time}`] || [];
                  return (
                    <td key={day} className="px-2.5 py-2.5 align-top">
                      {cellSlots.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {cellSlots.map((slot) => {
                            const colorClass = getLevelColors(slot.levelName);
                            return (
                              <button
                                type="button"
                                key={slot.batchId}
                                onClick={() => setActiveSlot(slot)}
                                className={`w-full rounded-xl border bg-gradient-to-br p-3 text-left transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_4px_20px_rgba(212,175,55,0.18)] active:scale-[0.98] ${colorClass}`}
                              >
                                <p className="truncate text-[12px] font-bold leading-snug">
                                  {slot.batchName}
                                </p>
                                <p className="mt-0.5 truncate text-[11px] font-medium opacity-75">
                                  {slot.levelName}
                                </p>
                                <div className="mt-1.5 flex items-center gap-1 opacity-60">
                                  <LinkIcon />
                                  <span className="text-[10px] uppercase tracking-[0.08em]">Meet</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-[4.5rem]" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {activeSlot && (
        <SlotDetailModal slot={activeSlot} onClose={() => setActiveSlot(null)} />
      )}
    </>
  );
}
