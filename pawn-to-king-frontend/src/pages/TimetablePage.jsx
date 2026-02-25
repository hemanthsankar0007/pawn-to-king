import { useEffect, useMemo, useState } from "react";
import { getTimetable } from "../api/apiService";
import LoadingPanel from "../components/LoadingPanel";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric"
});

const toComparableValue = (session) => {
  const dateValue = new Date(session?.date || 0).getTime();
  return Number.isFinite(dateValue) ? dateValue : 0;
};

function StatusBadge({ status }) {
  const styles = {
    Scheduled: "border-gold/30 bg-gold/10 text-gold",
    Completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
    Cancelled: "border-red-400/30 bg-red-400/10 text-red-400"
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        styles[status] || styles.Scheduled
      }`}
    >
      {status}
    </span>
  );
}

function SessionCard({ session, past = false }) {
  const readableDate = session?.date ? dateFormatter.format(new Date(session.date)) : "Unknown date";
  const hasTitle = Boolean(session.topicTitle);

  return (
    <article
      className={`rounded-xl border p-5 transition-colors ${
        past
          ? "border-gold/10 bg-bg/40 opacity-70"
          : "border-gold/40 bg-card/75 shadow-[0_0_0_1px_rgba(212,175,55,0.12)]"
      }`}
    >
      {/* Date + status row */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">{readableDate}</p>
        <StatusBadge status={session.status} />
      </div>

      {/* Level pill */}
      <div className="mt-3">
        <span className="inline-flex items-center rounded-full border border-gold/25 bg-gold/8 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold/80">
          {session.level} Level
        </span>
      </div>

      {/* Topic title */}
      <div className="mt-2 border-t border-gold/10 pt-3">
        {hasTitle ? (
          <h3 className="font-display text-lg leading-snug text-text">
            {session.topicTitle}
          </h3>
        ) : (
          <h3 className="font-display text-lg text-text/60">Session</h3>
        )}
        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-text/40">
          Topic {session.topic}
        </p>
      </div>

      {/* Time */}
      <p className="mt-3 text-sm text-text/70">
        {session.startTime}–{session.endTime}
      </p>

      {/* Join button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => window.open(session.meetLink, "_blank", "noopener,noreferrer")}
          disabled={!session.meetLink || session.status === "Cancelled"}
          className="primary-btn inline-flex min-h-[2.4rem] items-center rounded-lg px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          Join Session
        </button>
      </div>
    </article>
  );
}

function TimetablePage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [unassignedMessage, setUnassignedMessage] = useState("You have not yet been assigned to a batch.");
  const [batch, setBatch] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadTimetable = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getTimetable();
        if (!mounted) {
          return;
        }

        setBatch(response?.batch || null);
        setUpcomingSessions(response?.upcomingSessions || []);
        setPastSessions(response?.pastSessions || []);
        if (response?.message) {
          setUnassignedMessage(String(response.message));
        }
      } catch (_error) {
        if (mounted) {
          setErrorMessage("Unable to load timetable right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTimetable();

    return () => {
      mounted = false;
    };
  }, []);

  const upcoming = useMemo(
    () => [...upcomingSessions].sort((a, b) => toComparableValue(a) - toComparableValue(b)),
    [upcomingSessions]
  );

  const past = useMemo(
    () => [...pastSessions].sort((a, b) => toComparableValue(a) - toComparableValue(b)),
    [pastSessions]
  );

  if (loading) {
    return <LoadingPanel text="Loading timetable..." />;
  }

  return (
    <PageTransition className="space-y-6 text-left">
      <section className="glass-card rounded-2xl p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Timetable</p>
        <h1 className="mt-3 font-display text-[clamp(1.8rem,2.5vw,2.6rem)]">Class Schedule</h1>
        {batch ? (
          <p className="mt-3 text-sm text-text/80">
            {batch.name} | {batch.level} | {batch.time} ({batch.timezone})
          </p>
        ) : (
          <p className="mt-3 text-sm text-text/75">
            {unassignedMessage}
          </p>
        )}
      </section>

      <StatusMessage type="error" text={errorMessage} />

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-gold">Upcoming Sessions</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-xl border border-gold/15 bg-card/60 p-4 text-sm text-text/75">
            No upcoming sessions scheduled.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((session) => (
              <SessionCard key={session._id} session={session} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Past Sessions</h2>
        {past.length === 0 ? (
          <p className="rounded-xl border border-gold/10 bg-bg/40 p-4 text-sm text-text/70">
            No past sessions yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {past.map((session) => (
              <SessionCard key={session._id} session={session} past />
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
}

export default TimetablePage;
