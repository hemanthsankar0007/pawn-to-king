import { useEffect, useState } from "react";
import { getNextClassroomSession } from "../api/apiService";
import LoadingPanel from "../components/LoadingPanel";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";

const formatSessionDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
};

const isToday = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

function ClassroomPage() {
  const [sessionData, setSessionData] = useState(null);
  const [adminSessions, setAdminSessions] = useState(null); // null = not admin
  const [emptyState, setEmptyState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadClassroom = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getNextClassroomSession();

        // Admin sees all sessions
        if (response?.role === "admin") {
          setAdminSessions(response.sessions || []);
          return;
        }

        if (response?.reason === "scheduled" && response?.meetLink) {
          setSessionData(response);
          setEmptyState(null);
          return;
        }

        setSessionData(null);

        if (response?.reason === "no_batch") {
          setEmptyState({
            type: "no_batch",
            message: "You have not yet been assigned to a batch. Please contact admin."
          });
          return;
        }

        setEmptyState({
          type: "no_session",
          message: "No class is currently scheduled. Please check back later or contact the academy."
        });
      } catch (_requestError) {
        setSessionData(null);
        setEmptyState(null);
        setErrorMessage("Unable to load classroom schedule right now.");
      } finally {
        setLoading(false);
      }
    };

    loadClassroom();
  }, []);

  const handleJoin = () => {
    if (!sessionData?.meetLink) {
      return;
    }

    window.open(sessionData.meetLink, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return <LoadingPanel text="Loading classroom..." />;
  }

  // Admin view — all upcoming sessions
  if (adminSessions !== null) {
    return (
      <PageTransition className="rounded-2xl border border-gold/20 bg-card/80 p-6 text-left md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin Classroom</p>
        <h1 className="mt-3 font-display text-3xl">Upcoming Sessions</h1>

        {adminSessions.length === 0 ? (
          <section className="mt-6 rounded-xl border border-gold/20 bg-bg/45 p-6 text-center">
            <p className="text-base text-text/85">No upcoming sessions scheduled.</p>
          </section>
        ) : (
          <div className="mt-6 space-y-4">
            {adminSessions.map((session) => (
              <section
                key={session._id}
                className="rounded-xl border border-gold/30 bg-gold/5 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-text/85">
                    Batch: <span className="font-semibold text-gold">{session.batchName}</span>
                  </p>
                  <span className="text-text/45">|</span>
                  <p className="text-sm text-text/85">
                    Level: <span className="font-semibold text-gold">{session.level}</span>
                  </p>
                  {isToday(session.sessionDate) ? (
                    <span className="rounded-full border border-gold/55 bg-gold/16 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold">
                      Today
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 font-display text-xl text-gold">
                  Topic {session.topic} — {session.topicTitle}
                </p>

                <div className="mt-3 space-y-1 text-sm text-text/80">
                  <p>
                    Date: <span className="font-semibold text-text">{formatSessionDate(session.sessionDate)}</span>
                  </p>
                  <p>
                    Time:{" "}
                    <span className="font-semibold text-text">
                      {session.startTime} – {session.endTime} ({session.timezone})
                    </span>
                  </p>
                </div>

                {session.meetLink ? (
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-btn mt-4 inline-flex min-h-[2.75rem] items-center justify-center rounded-lg px-6 py-2 text-sm font-semibold"
                  >
                    Join Session
                  </a>
                ) : (
                  <p className="mt-3 text-xs text-text/45">No meet link configured.</p>
                )}
              </section>
            ))}
          </div>
        )}
      </PageTransition>
    );
  }

  return (
    <PageTransition className="rounded-2xl border border-gold/20 bg-card/80 p-6 text-left md:p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Classroom</p>
      <h1 className="mt-3 font-display text-3xl">Next Live Session</h1>
      <StatusMessage type="error" text={errorMessage} className="mt-5" />

      {sessionData ? (
        <section className="mt-6 rounded-xl border border-gold/45 bg-gold/10 p-5 shadow-[0_0_0_1px_rgba(212,175,55,0.18)]">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-text/85">
              Batch: <span className="font-semibold text-gold">{sessionData.batchName}</span>
            </p>
            <span className="text-text/45">|</span>
            <p className="text-sm text-text/85">
              Level: <span className="font-semibold text-gold">{sessionData.level}</span>
            </p>
            {isToday(sessionData.sessionDate) ? (
              <span className="rounded-full border border-gold/55 bg-gold/16 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold">
                Today&apos;s Session
              </span>
            ) : null}
          </div>

          <p className="mt-4 font-display text-3xl text-gold">
            Topic {sessionData.topic} - {sessionData.topicTitle}
          </p>

          <div className="mt-4 space-y-2 text-sm text-text/85">
            <p>
              Scheduled On: <span className="font-semibold text-text">{formatSessionDate(sessionData.sessionDate)}</span>
            </p>
            <p>
              Time:{" "}
              <span className="font-semibold text-text">
                {sessionData.startTime} - {sessionData.endTime} ({sessionData.timezone || "IST"})
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleJoin}
            className="primary-btn mt-5 inline-flex min-h-[2.9rem] items-center justify-center rounded-lg px-8 py-3 text-base font-semibold"
          >
            Join Live Session
          </button>
        </section>
      ) : (
        <section className="mt-6 rounded-xl border border-gold/20 bg-bg/45 p-6 text-center">
          <p className="text-base text-text/85">
            {emptyState?.message ||
              "No class is currently scheduled. Please check back later or contact the academy."}
          </p>
        </section>
      )}
    </PageTransition>
  );
}

export default ClassroomPage;
