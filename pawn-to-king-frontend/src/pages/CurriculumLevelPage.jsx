import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurriculumLevel } from "../api/apiService";
import LoadingPanel from "../components/LoadingPanel";
import PageTransition from "../components/PageTransition";
import StatusMessage from "../components/StatusMessage";
import AccordionTopic from "../components/AccordionTopic";
import { findPublicCurriculumLevel } from "../data/publicCurriculum";
import { getLevelConfig } from "../config/levelConfig";
import { toLevelName, toLevelSlug } from "../utils/levelUtils";
import useParallaxTilt from "../hooks/useParallaxTilt";

const normalizeTopic = (topic, fallbackId) => ({
  id: topic?.id || topic?._id || fallbackId,
  title: topic?.title || "Untitled Topic",
  difficulty: topic?.difficulty || topic?.difficultyLevel || "Intermediate",
  description: topic?.description || topic?.shortDescription || "Lesson details available soon.",
  learnings: Array.isArray(topic?.learnings)
    ? topic.learnings
    : topic?.learningObjective
      ? [topic.learningObjective]
      : ["Practical improvement through guided study."],
  duration: Number(topic?.duration ?? topic?.estimatedDuration ?? 20)
});

const normalizeLevelPayload = (levelPayload) => {
  if (!levelPayload) {
    return null;
  }

  return {
    levelName: levelPayload.levelName,
    slug: levelPayload.slug || toLevelSlug(levelPayload.levelName),
    sections: (levelPayload.sections || []).map((section, sectionIndex) => ({
      name: section.name,
      topics: (section.topics || []).map((topic, topicIndex) =>
        normalizeTopic(topic, `${toLevelSlug(levelPayload.levelName)}-${sectionIndex}-${topicIndex}`)
      )
    }))
  };
};

const flattenTopics = (sections) => {
  let topicNumber = 0;
  return sections.flatMap((section) =>
    section.topics.map((topic) => {
      topicNumber += 1;
      return {
        ...topic,
        topicNumber
      };
    })
  );
};

function CurriculumLevelPage() {
  const { level } = useParams();
  const levelName = useMemo(() => toLevelName(level), [level]);
  const levelSlug = useMemo(() => toLevelSlug(levelName), [levelName]);
  const [levelData, setLevelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");
  const [openTopicId, setOpenTopicId] = useState(null);
  const [pieceSrc, setPieceSrc] = useState("/assets/default-piece.svg");
  const { containerRef, enabled, style, handlers } = useParallaxTilt(22);

  if (!levelName) {
    return <Navigate to="/curriculum" replace />;
  }

  const config = getLevelConfig(levelName);

  useEffect(() => {
    setPieceSrc(`/assets/${levelSlug}.png`);
  }, [levelSlug]);

  useEffect(() => {
    const loadLevel = async () => {
      try {
        setLoading(true);
        setWarning("");
        const response = await getCurriculumLevel(toLevelSlug(levelName));
        const normalized = normalizeLevelPayload(response?.level);

        if (!normalized || normalized.sections.length === 0) {
          const fallback = normalizeLevelPayload(findPublicCurriculumLevel(toLevelSlug(levelName)));
          setLevelData(fallback);
          setWarning("Live curriculum is empty. Showing local level data.");
        } else {
          setLevelData(normalized);
        }
      } catch (_error) {
        const fallback = normalizeLevelPayload(findPublicCurriculumLevel(toLevelSlug(levelName)));
        setLevelData(fallback);
        setWarning("Showing local level data while API is unavailable.");
      } finally {
        setLoading(false);
      }
    };

    loadLevel();
  }, [levelName]);

  if (loading) {
    return <LoadingPanel text="Loading level curriculum..." />;
  }

  if (!levelData) {
    return <Navigate to="/curriculum" replace />;
  }

  const topics = flattenTopics(levelData.sections);

  return (
    <div className="overflow-x-auto">
      <PageTransition className="mx-auto w-full min-w-[340px] max-w-[1400px] px-4 py-8 md:px-6 md:py-10">
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="level-page-shell grid gap-6 lg:grid-cols-[35%_65%] lg:items-start"
        style={{ "--level-theme": config.themeColor }}
      >
        <aside className="level-left-column lg:sticky lg:top-[120px]">
          <div className={`hero-image level-hero-shell ${config.background}`}>
            <div className="level-hero-grid-overlay" />
            <div className="level-hero-radial-glow" />
            <div className="level-hero-blur-shape level-hero-blur-shape-a" />
            <div className="level-hero-blur-shape level-hero-blur-shape-b" />
            {levelSlug === "king" ? <div className="king-particles" /> : null}

            <motion.div
              ref={containerRef}
              className="hero-piece-wrap"
              {...handlers}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <motion.img
                src={pieceSrc}
                onError={() => setPieceSrc("/assets/default-piece.svg")}
                alt={`${levelName} chess piece`}
                className="hero-piece-image"
                style={enabled ? style : undefined}
                loading="lazy"
                width="1024"
                height="1024"
              />
            </motion.div>
          </div>

          <div className="level-left-meta mt-4 rounded-2xl bg-card/65 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-gold">
              {levelName} ({config.rating})
            </p>
            <h1 className="level-title mt-3 font-display font-bold text-text">{config.title}</h1>
            <p className="level-body mt-3 break-words text-text/88">{config.subtitle}</p>
          </div>
        </aside>

        <section className="level-topics-panel rounded-2xl bg-card/45 p-5 md:p-7">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-gold">
              {levelName} ({config.rating})
            </p>
            <h2 className="level-title mt-2 font-display font-bold text-text">{config.title}</h2>
            <p className="level-body mt-2 break-words text-text/88">{config.subtitle}</p>
          </div>

          <div className="space-y-4">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.18 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.02 }}
              >
                <AccordionTopic
                  topicNumber={topic.topicNumber}
                  topic={topic}
                  themeColor={config.themeColor}
                  isOpen={openTopicId === topic.id}
                  onClick={() =>
                    setOpenTopicId((previous) => (previous === topic.id ? null : topic.id))
                  }
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-7">
            <Link
              to="/curriculum"
              className="secondary-btn inline-flex min-h-[2.65rem] items-center rounded-lg px-4 text-xs font-semibold"
            >
              Back to All Levels
            </Link>
          </div>
        </section>
      </motion.section>
      </PageTransition>
    </div>
  );
}

export default CurriculumLevelPage;
