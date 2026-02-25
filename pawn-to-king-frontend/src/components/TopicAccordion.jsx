import { AnimatePresence, motion } from "framer-motion";

const difficultyClass = {
  Beginner: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  Intermediate: "border-gold/35 bg-gold/10 text-gold",
  Advanced: "border-amber-400/35 bg-amber-400/10 text-amber-200"
};

function TopicAccordion({ topic, topicNumber, isOpen, onToggle, unlockRequirement }) {
  const panelId = `topic-panel-${topic.id}`;

  return (
    <article className="topic-accordion-card magnetic-target rounded-xl border border-gold/20 bg-card/70 px-4 py-3 md:px-5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="topic-number-badge">{topicNumber}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl text-text">{topic.title}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${difficultyClass[topic.difficulty] || difficultyClass.Intermediate}`}
        >
          {topic.difficulty}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="text-gold"
          aria-hidden="true"
        >
          {"\u276f"}
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="topic-accordion-panel"
          >
            <div className="mt-4 border-t border-gold/15 pt-4">
              <p className="text-sm leading-relaxed text-text/80">{topic.description}</p>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gold">What You Will Learn</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text/80">
                  {topic.learnings.map((learning) => (
                    <li key={learning}>{learning}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-text/70">
                <span className="rounded-full border border-gold/25 bg-bg/50 px-3 py-1">
                  Estimated Time: {topic.duration} Min
                </span>
                {unlockRequirement ? (
                  <span className="rounded-full border border-gold/25 bg-bg/50 px-3 py-1">
                    Unlock Requirement: {unlockRequirement}
                  </span>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export default TopicAccordion;
