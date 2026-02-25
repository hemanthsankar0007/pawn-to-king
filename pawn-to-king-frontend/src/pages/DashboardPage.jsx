import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getAdminApplications, getAdminStudents, getCurrentTopic, getNextClassroomSession } from "../api/apiService";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/StatusMessage";
import LoadingPanel from "../components/LoadingPanel";
import PageTransition from "../components/PageTransition";
import MagneticWrapper from "../components/MagneticWrapper";
import { consumeFlashMessage } from "../utils/flashMessage";
import { getUserProgress, toLevelSlug } from "../utils/levelUtils";

const formatSessionDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

function AdminDashboard({ user, flashMessage }) {
  const [students, setStudents] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, appsRes, classroomRes] = await Promise.all([
          getAdminStudents("All"),
          getAdminApplications("pending"),
          getNextClassroomSession()
        ]);
        setStudents(studentsRes?.students || []);
        setPendingCount(appsRes?.applications?.length || 0);
        setSessions(classroomRes?.sessions || []);
      } catch (_error) {
        // non-critical
      } finally {
        setStatsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <PageTransition className="space-y-6">
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Admin Dashboard</p>
        <h1 className="mt-3 font-display text-3xl">Welcome, {user.name}</h1>
        <p className="mt-3 text-sm text-text/75">Manage students, review applications, and monitor sessions.</p>
        <StatusMessage type={flashMessage?.type || "info"} text={flashMessage?.text} className="mt-4" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="glass-card rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-text/60">Total Students</p>
          <p className="mt-3 font-display text-3xl text-gold">
            {statsLoading ? "—" : students.length}
          </p>
          <Link to="/admin" className="mt-3 inline-block text-xs text-gold/70 hover:text-gold">
            Manage students →
          </Link>
        </article>
        <article className="glass-card rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-text/60">Pending Applications</p>
          <p className="mt-3 font-display text-3xl text-gold">
            {statsLoading ? "—" : pendingCount}
          </p>
          <Link to="/admin" className="mt-3 inline-block text-xs text-gold/70 hover:text-gold">
            Review applications →
          </Link>
        </article>
        <article className="glass-card rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-text/60">Upcoming Sessions</p>
          <p className="mt-3 font-display text-3xl text-gold">
            {statsLoading ? "—" : sessions.length}
          </p>
          <Link to="/classroom" className="mt-3 inline-block text-xs text-gold/70 hover:text-gold">
            View classroom →
          </Link>
        </article>
      </section>

      {sessions.length > 0 && (
        <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Upcoming Sessions</p>
          <h2 className="mt-2 font-display text-xl">Next Classes</h2>
          <div className="mt-4 space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div key={session._id} className="flex items-center justify-between rounded-xl border border-gold/15 bg-bg/40 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-text">{session.batchName} <span className="ml-2 text-xs text-gold">({session.level})</span></p>
                  <p className="text-xs text-text/60 mt-0.5">
                    {formatSessionDate(session.sessionDate)} &nbsp;·&nbsp; {session.startTime} – {session.endTime} ({session.timezone})
                  </p>
                  <p className="text-xs text-text/55 mt-0.5">Topic {session.topic}: {session.topicTitle}</p>
                </div>
                {session.meetLink && (
                  <a
                    href={session.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-btn ml-4 inline-flex shrink-0 items-center rounded-lg px-3 py-1.5 text-xs font-semibold"
                  >
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
          {sessions.length > 5 && (
            <Link to="/classroom" className="mt-3 inline-block text-xs text-gold/70 hover:text-gold">
              View all {sessions.length} sessions →
            </Link>
          )}
        </section>
      )}

      {students.length > 0 && (
        <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Students</p>
          <h2 className="mt-2 font-display text-xl">Recent Students</h2>
          <div className="mt-4 space-y-2">
            {students.slice(0, 6).map((student) => (
              <div key={student._id} className="flex items-center justify-between rounded-xl border border-gold/10 bg-bg/30 px-4 py-2.5 text-sm">
                <div>
                  <p className="font-medium text-text">{student.name}</p>
                  <p className="text-xs text-text/55">{student.email}</p>
                </div>
                <span className="text-xs font-semibold text-gold">{student.currentLevel}</span>
              </div>
            ))}
          </div>
          {students.length > 6 && (
            <Link to="/admin" className="mt-3 inline-block text-xs text-gold/70 hover:text-gold">
              View all {students.length} students →
            </Link>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <div className="flex flex-wrap gap-3">
          <Link to="/admin" className="primary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 py-2 text-sm font-semibold">
            Admin Panel
          </Link>
          <Link to="/admin/timetable" className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 py-2 text-sm font-semibold">
            Manage Timetable
          </Link>
          <Link to="/classroom" className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 py-2 text-sm font-semibold">
            View Classroom
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}

function DashboardPage() {
  const { profile, loading } = useAuth();
  // Consume synchronously during render so it is read exactly once,
  // whether or not the component unmounts before its first useEffect fires.
  const [flashMessage, setFlashMessage] = useState(() => consumeFlashMessage());
  const [currentTopicTitle, setCurrentTopicTitle] = useState("");
  const [currentTopicTitleLoading, setCurrentTopicTitleLoading] = useState(false);
  const [homeworkLink, setHomeworkLink] = useState("");

  useEffect(() => {
    if (!flashMessage?.text) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setFlashMessage(null);
    }, 4000);

    return () => clearTimeout(timeoutId);
  }, [flashMessage]);

  useEffect(() => {
    if (!profile || profile?.user?.role === "admin") {
      return undefined;
    }

    const { currentTopic, totalTopics } = getUserProgress(profile);

    if (currentTopic > totalTopics) {
      setCurrentTopicTitle("");
      setCurrentTopicTitleLoading(false);
      return undefined;
    }

    let mounted = true;

    const loadCurrentTopic = async () => {
      try {
        setCurrentTopicTitleLoading(true);
        const response = await getCurrentTopic();
        if (!mounted) return;
        setCurrentTopicTitle(response?.title || "");
        setHomeworkLink(response?.homeworkLink || "");
      } catch (_error) {
        if (!mounted) return;
        setCurrentTopicTitle("");
        setHomeworkLink("");
      } finally {
        if (mounted) setCurrentTopicTitleLoading(false);
      }
    };

    loadCurrentTopic();

    return () => {
      mounted = false;
    };
  }, [profile]);

  if (loading || !profile) {
    return <LoadingPanel text="Loading dashboard..." />;
  }

  const { user } = profile;

  if (user.role === "admin") {
    return <AdminDashboard user={user} flashMessage={flashMessage} />;
  }

  const {
    currentLevel,
    currentTopic,
    completedTopics,
    totalTopics,
    percentage: progressPercentage
  } = getUserProgress(profile);
  const nextTopicAvailable = currentTopic <= totalTopics;
  const currentTopicPath = `/topic/${toLevelSlug(currentLevel)}/${currentTopic}`;
  const currentTopicLabel = currentTopicTitleLoading
    ? "Loading topic title..."
    : currentTopicTitle || "Current topic title unavailable";

  return (
    <PageTransition className="space-y-6">
      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Dashboard</p>
        <h1 className="mt-3 font-display text-3xl">Welcome, {user.name}</h1>
        <p className="mt-3 text-sm text-text/75">
          Stay consistent through each level. Submit homework and join classrooms to progress.
        </p>
        <StatusMessage
          type={flashMessage?.type || "info"}
          text={flashMessage?.text}
          className="mt-4"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="glass-card rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-text/60">Current Level</p>
          <p className="mt-3 font-display text-2xl text-gold">{currentLevel}</p>
        </article>
        <article className="glass-card rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-text/60">Current Topic</p>
          {nextTopicAvailable ? (
            <div className="mt-3 inline-flex flex-wrap items-baseline gap-2">
              <span className="font-display text-2xl text-gold">Topic {currentTopic}</span>
              <span className="text-base text-text/78">- {currentTopicLabel}</span>
            </div>
          ) : (
            <p className="mt-3 font-display text-2xl text-gold">Level Complete</p>
          )}
        </article>
        <article className="glass-card rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-text/60">Progress</p>
          <p className="mt-3 font-display text-2xl text-gold">{progressPercentage}%</p>
          <p className="mt-1 text-xs text-text/65">
            {completedTopics}/{totalTopics} topics completed
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg">
            <motion.div
              className="h-full rounded-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
        </article>
      </section>

      {user.finalSchedule?.time ? (
        <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Your Class Schedule</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
            {user.finalSchedule.days?.length > 0 && (
              <div>
                <p className="text-xs text-text/60 uppercase tracking-wider">Days</p>
                <p className="mt-1 font-medium text-text">{user.finalSchedule.days.join(", ")}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-text/60 uppercase tracking-wider">Time</p>
              <p className="mt-1 font-medium text-gold">{user.finalSchedule.time}</p>
            </div>
            {user.finalSchedule.timezone && (
              <div>
                <p className="text-xs text-text/60 uppercase tracking-wider">Timezone</p>
                <p className="mt-1 font-medium text-text">{user.finalSchedule.timezone}</p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-gold/20 bg-card/80 p-6 md:p-8">
        <div className="flex flex-wrap gap-3">
          {nextTopicAvailable ? (
            <MagneticWrapper className="w-full sm:w-auto" strength={5}>
              <Link
                to={currentTopicPath}
                className="primary-btn inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold sm:w-auto"
              >
                Next Topic: {currentTopic}
              </Link>
            </MagneticWrapper>
          ) : (
            <span className="w-full rounded-lg border border-gold/35 bg-gold/10 px-4 py-2 text-center text-sm font-semibold text-gold sm:w-auto">
              Level complete. Waiting for level upgrade.
            </span>
          )}
          <Link
            to="/curriculum"
            className="secondary-btn inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold sm:w-auto"
          >
            View Curriculum
          </Link>
          {homeworkLink ? (
            <a
              href={homeworkLink}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold sm:w-auto"
            >
              Go to Homework
            </a>
          ) : (
            <Link
              to="/homework"
              className="primary-btn inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold sm:w-auto"
            >
              Go to Homework
            </Link>
          )}
          <Link
            to="/classroom"
            className="secondary-btn inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold sm:w-auto"
          >
            Enter Classroom
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}

export default DashboardPage;
