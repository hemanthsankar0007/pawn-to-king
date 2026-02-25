import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurriculum } from "../api/apiService";
import PageTransition from "../components/PageTransition";
import RevealSection from "../components/RevealSection";
import LoadingPanel from "../components/LoadingPanel";
import StatusMessage from "../components/StatusMessage";
import { PUBLIC_CURRICULUM_STRUCTURED } from "../data/publicCurriculum";
import { LEVEL_NAMES, toLevelSlug } from "../utils/levelUtils";
import { getLevelConfig } from "../config/levelConfig";

const normalizeLevels = (levels = []) =>
  levels.map((level) => ({
    levelName: level.levelName,
    slug: level.slug || toLevelSlug(level.levelName),
    totalTopics: level.totalTopics || 0
  }));

function CurriculumPage() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        setLoading(true);
        setWarning("");
        const response = await getCurriculum();
        const normalized = normalizeLevels(response?.levels || []);

        if (normalized.length === 0) {
          const fallback = normalizeLevels(PUBLIC_CURRICULUM_STRUCTURED);
          setLevels(fallback);
          setWarning("Live curriculum is empty. Showing local curriculum data.");
        } else {
          setLevels(normalized);
        }
      } catch (_error) {
        const fallback = normalizeLevels(PUBLIC_CURRICULUM_STRUCTURED);
        setLevels(fallback);
        setWarning("Showing local curriculum preview while API is unavailable.");
      } finally {
        setLoading(false);
      }
    };

    loadCurriculum();
  }, []);

  if (loading) {
    return <LoadingPanel text="Loading curriculum levels..." />;
  }

  const orderedLevels = LEVEL_NAMES.map((name) => levels.find((level) => level.levelName === name)).filter(Boolean);

  return (
    <PageTransition className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <RevealSection>
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Public Curriculum</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Choose Your Level</h1>
        <p className="mt-4 max-w-3xl text-text/80">
          Open to all users. Select a level to view only that level’s curriculum.
        </p>

      </RevealSection>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {orderedLevels.map((level, index) => {
          const config = getLevelConfig(level.levelName);
          return (
            <motion.article
              key={level.levelName}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.04 }}
              className="magnetic-target glass-card rounded-2xl p-5 transition-all duration-300 hover:border-gold/40 hover:shadow-[0_16px_28px_rgba(0,0,0,0.28)]"
              style={{ "--level-theme": config.themeColor }}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-gold">{level.levelName}</p>
              <h2 className="mt-2 font-display text-3xl">{config.title}</h2>
              <p className="mt-2 text-sm text-text/75">{config.subtitle}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.15em] text-text/65">
                Rating: {config.rating}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.15em] text-text/65">
                Topics: {level.totalTopics || 0}
              </p>
              <Link
                to={`/curriculum/${toLevelSlug(level.levelName)}`}
                className="primary-btn mt-5 inline-flex min-h-[2.65rem] items-center rounded-lg px-4 text-xs font-semibold"
              >
                Explore {level.levelName}
              </Link>
            </motion.article>
          );
        })}
      </section>
    </PageTransition>
  );
}

export default CurriculumPage;
