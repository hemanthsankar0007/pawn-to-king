import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getHomeworkConfigLink } from "../api/apiService";
import { useAuth } from "../context/AuthContext";
import LoadingPanel from "../components/LoadingPanel";
import PageTransition from "../components/PageTransition";
import EmptyStateCard from "../components/EmptyStateCard";
import MagneticWrapper from "../components/MagneticWrapper";
import StatusMessage from "../components/StatusMessage";
import { getUserProgress, toLevelSlug } from "../utils/levelUtils";

function HomeworkPage() {
  const { profile, loading } = useAuth();
  const profileHomeworkLink = profile?.homeworkLink || "";
  const [homeworkLink, setHomeworkLink] = useState(profileHomeworkLink);
  const [homeworkLinkLoading, setHomeworkLinkLoading] = useState(!profileHomeworkLink);
  const [homeworkLinkError, setHomeworkLinkError] = useState("");

  useEffect(() => {
    if (!profile) {
      return undefined;
    }

    if (profileHomeworkLink) {
      setHomeworkLink(profileHomeworkLink);
      setHomeworkLinkError("");
      setHomeworkLinkLoading(false);
      return undefined;
    }

    let mounted = true;

    const loadHomeworkLink = async () => {
      try {
        setHomeworkLinkLoading(true);
        setHomeworkLinkError("");
        const response = await getHomeworkConfigLink();
        if (!mounted) {
          return;
        }
        setHomeworkLink(response?.link || "");
      } catch (_error) {
        if (!mounted) {
          return;
        }
        setHomeworkLinkError("Unable to load homework link right now.");
      } finally {
        if (mounted) {
          setHomeworkLinkLoading(false);
        }
      }
    };

    loadHomeworkLink();

    return () => {
      mounted = false;
    };
  }, [profile, profileHomeworkLink]);

  if (loading || !profile) {
    return <LoadingPanel text="Loading homework dashboard..." />;
  }

  const { currentLevel, currentTopic, totalTopics } = getUserProgress(profile);
  const levelCompleted = currentTopic > totalTopics;

  return (
    <PageTransition className="space-y-6">
      <section className="glass-card rounded-2xl p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Homework Center</p>
        <h1 className="mt-2 font-display text-3xl">Continue Your Learning Path</h1>
        <p className="mt-3 text-sm text-text/80">
          Start your assigned topic, submit homework, and unlock the next lesson instantly.
        </p>
      </section>

      {!levelCompleted ? (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Current Topic</p>
          <h2 className="mt-3 font-display text-3xl text-gold">
            {currentLevel} - Topic {currentTopic}
          </h2>
          <p className="mt-2 text-sm text-text/80">
            Complete this topic homework with at least 70% to unlock the next lesson.
          </p>
          <StatusMessage type="error" text={homeworkLinkError} className="mt-4" />
          <div className="mt-5 flex flex-wrap gap-3">
            <MagneticWrapper className="w-full sm:w-auto" strength={4}>
              <button
                type="button"
                onClick={() => window.open(homeworkLink, "_blank", "noopener,noreferrer")}
                disabled={homeworkLinkLoading || !homeworkLink}
                className="primary-btn inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {homeworkLinkLoading ? "Loading Link..." : "Start Topic"}
              </button>
            </MagneticWrapper>
            <Link
              to={`/curriculum/${toLevelSlug(currentLevel)}`}
              className="secondary-btn inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold sm:w-auto"
            >
              View Full Level Topics
            </Link>
          </div>
        </motion.section>
      ) : (
        <EmptyStateCard
          title="Level Complete"
          text="You have completed all available topics for this level. Await your manual level promotion."
        />
      )}
    </PageTransition>
  );
}

export default HomeworkPage;
