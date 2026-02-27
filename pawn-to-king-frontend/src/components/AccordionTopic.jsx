import { AnimatePresence, motion } from "framer-motion";

const difficultyStyles = {
  Beginner: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  Intermediate: "border-sky-400/35 bg-sky-400/10 text-sky-200",
  Advanced: "border-amber-400/35 bg-amber-400/10 text-amber-200"
};

function AccordionTopic({ topicNumber, topic, isOpen, onClick, themeColor }) {
  const panelId = `accordion-topic-${topic.id}`;

  return (
    <motion.article
      layout
      className="magnetic-target overflow-hidden rounded-xl border border-white/10 bg-card/80 shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-300 hover:border-gold/45 hover:shadow-[0_14px_28px_rgba(0,0,0,0.28)]"
      style={{ boxShadow: isOpen ? `0 0 0 1px ${themeColor}66, 0 14px 28px rgba(0,0,0,0.3)` : undefined }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="grid w-full grid-cols-[auto_1fr] items-start gap-x-3 gap-y-2 px-4 py-4 text-left md:flex md:items-start md:gap-3 md:px-6 md:py-5"
      >
        <span className="topic-number-badge">{topicNumber}</span>
        <p className="min-w-0 flex-1 whitespace-normal break-words font-display text-[clamp(1.15rem,1.35vw,1.45rem)] font-semibold leading-[1.45] text-text">
          {topic.title}
        </p>
        <div className="col-span-2 flex w-full items-center justify-end gap-2 md:ml-auto md:w-auto">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
              difficultyStyles[topic.difficulty] || difficultyStyles.Intermediate
            }`}
          >
            {topic.difficulty}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-gold"
            aria-hidden="true"
          >
            {"\u276f"}
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-white/10 px-5 pb-5 pt-5 md:px-6">
              <p className="text-[clamp(1rem,1.1vw,1.1rem)] leading-[1.7] text-text/90">{topic.description}</p>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gold">What You Will Learn</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[clamp(1rem,1.05vw,1.08rem)] leading-[1.7] text-text/88">
                  {(topic.learnings || []).map((learning) => (
                    <li key={learning}>{learning}</li>
                  ))}
                </ul>
              </div>
              <p className="text-xs uppercase tracking-[0.16em] text-text/75">
                Estimated Time: {topic.duration} min
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export default AccordionTopic;
