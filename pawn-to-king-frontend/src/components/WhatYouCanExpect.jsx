import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const EXPECTATIONS = [
  {
    title: "200-300 Rating Point Increase",
    summary: "Built through structured practice cycles, measured progress reviews, and practical play correction."
  },
  {
    title: "Complete Tactical Mastery",
    summary: "Pattern recognition, forcing lines, and tactical conversion become second nature under time pressure."
  },
  {
    title: "Structured Opening Preparation",
    summary: "Develop reliable opening systems with clear plans instead of rote memorization."
  },
  {
    title: "Endgame Confidence",
    summary: "Convert winning positions and defend difficult endings with repeatable technique."
  },
  {
    title: "Tournament Psychology & Pressure Control",
    summary: "Train focus, resilience, and decision quality in critical moments."
  },
  {
    title: "Practical Game Analysis Training",
    summary: "Learn how to review games effectively, detect recurring mistakes, and build smarter study loops."
  }
];

function IconBadge() {
  return (
    <div className="expectation-icon flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/35 bg-gold/10 text-gold shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6.75 6.75h10.5v10.5H6.75z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ExpectationBlock({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reverse = index % 2 === 1;
  const xOffset = reverse ? 56 : -56;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, x: xOffset, y: 18 }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: index * 0.2 }}
      className={`expectation-card magnetic-target grid gap-6 rounded-2xl border border-gold/30 bg-card/80 p-8 md:min-h-[13rem] ${
        reverse ? "md:grid-cols-[1fr_auto]" : "md:grid-cols-[auto_1fr]"
      } md:items-start`}
    >
      {reverse ? (
        <>
          <div className="max-w-[800px] space-y-3">
            <h3 className="font-display text-[clamp(1.5rem,2vw,2rem)] font-bold leading-tight">{item.title}</h3>
            <p className="text-[clamp(1rem,1.1vw,1.1rem)] leading-[1.7] text-text/90">{item.summary}</p>
          </div>
          <IconBadge />
        </>
      ) : (
        <>
          <IconBadge />
          <div className="max-w-[800px] space-y-3">
            <h3 className="font-display text-[clamp(1.5rem,2vw,2rem)] font-bold leading-tight">{item.title}</h3>
            <p className="text-[clamp(1rem,1.1vw,1.1rem)] leading-[1.7] text-text/90">{item.summary}</p>
          </div>
        </>
      )}
    </motion.article>
  );
}

function WhatYouCanExpect() {
  return (
    <section className="expectation-track py-12 text-left md:py-20">
      <h2 className="expectation-title mt-3 max-w-4xl text-left font-display font-bold text-text">
        Your transformation from beginner to competitive thinker.
      </h2>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {EXPECTATIONS.map((item, index) => (
          <ExpectationBlock key={item.title} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

export default WhatYouCanExpect;
