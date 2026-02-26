import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import RevealSection from "../components/RevealSection";
import WhatYouCanExpect from "../components/WhatYouCanExpect";
import JoinCtaSection from "../components/JoinCtaSection";
import ApplicationForm from "../components/ApplicationForm";
import ApplicationSuccessNotice from "../components/ApplicationSuccessNotice";
import HomeHero from "../components/HomeHero";
import AboutCoach from "../components/AboutCoach";
import { LEVEL_META, toLevelSlug } from "../utils/levelUtils";

function SectionBanner({ label, from = "left" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.2 });
  const isLeft = from === "left";

  return (
    <div
      ref={ref}
      className="overflow-hidden py-5"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      <motion.div
        className="flex"
        style={{ justifyContent: isLeft ? "flex-start" : "flex-end" }}
        initial={{ x: isLeft ? "-100%" : "100%" }}
        animate={inView ? { x: "0%" } : { x: isLeft ? "-100%" : "100%" }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          className="select-none font-display font-bold uppercase leading-none tracking-[0.3em] text-gold/60"
          style={{
            fontSize: "clamp(1.4rem, 2.6vw, 2.2rem)",
            paddingLeft: isLeft ? "2vw" : "1.5rem",
            paddingRight: isLeft ? "1.5rem" : "2vw",
            borderTop: "1px solid rgba(212,175,55,0.18)",
            borderBottom: "1px solid rgba(212,175,55,0.18)",
            paddingTop: "0.55rem",
            paddingBottom: "0.55rem",
          }}
        >
          {label}
        </p>
      </motion.div>
    </div>
  );
}

function ContentReveal({ children, from = "right" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.08 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: from === "right" ? 90 : -90 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: from === "right" ? 90 : -90 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LandingPage() {
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [modalPlacement, setModalPlacement] = useState(null);

  const openJoinModal = () => {
    setModalPlacement(null);
    setJoinModalOpen(true);
  };

  const closeJoinModal = () => {
    setJoinModalOpen(false);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(212,175,55,0.14),transparent_38%)]" />
      <div className="pointer-events-none absolute right-[-8%] top-[15%] -z-10 h-64 w-64 rounded-full bg-gold/20 blur-[120px]" />

      <HomeHero />

      <div className="home-container">
        <SectionBanner label="About the Coach" from="left" />
        <ContentReveal from="right">
          <AboutCoach />
        </ContentReveal>

        <SectionBanner label="Program Structure" from="right" />
        <ContentReveal from="left">
        <RevealSection id="program-structure" className="py-12 text-left lg:py-16">
          <h2 className="mt-3 font-display text-[clamp(2.2rem,3.4vw,3.8rem)] font-bold">
            Six Levels. One Consistent Ascent.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEVEL_META.map((card, index) => (
              <motion.article
                key={card.name}
                className="glass-card magnetic-target group soft-hover rounded-2xl p-6 text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
              >
                <p className="font-display text-3xl text-gold transition-colors group-hover:text-gold-hover">
                  {card.name}{" "}
                  <span className="inline align-middle text-sm tracking-[0.08em] text-gold/90">
                    ({card.ratingRange})
                  </span>
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gold/80">{card.powerTitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-text/82">{card.tagline}</p>
                <Link
                  to={`/curriculum/${toLevelSlug(card.name)}`}
                  className="secondary-btn mt-4 inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold"
                >
                  Explore Level
                </Link>
              </motion.article>
            ))}
          </div>
        </RevealSection>
        </ContentReveal>

        <SectionBanner label="What You Can Expect" from="left" />
        <ContentReveal from="right">
          <WhatYouCanExpect />
        </ContentReveal>
      </div>

      <div className="home-container">
        <SectionBanner label="Final Step" from="right" />
      </div>
      <ContentReveal from="left">
        <JoinCtaSection onJoin={openJoinModal} />
      </ContentReveal>

      {joinModalOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/70 p-4 backdrop-blur-sm md:p-8">
          <div className="mx-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gold/30 bg-card/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)] md:p-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.22em] text-gold">Join Pawn to King</p>
              <button
                type="button"
                onClick={closeJoinModal}
                className="secondary-btn inline-flex min-h-[2.5rem] items-center rounded-lg px-3 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            {modalPlacement ? (
              <ApplicationSuccessNotice
                onSubmitAnother={() => setModalPlacement(null)}
                onDone={closeJoinModal}
              />
            ) : (
              <ApplicationForm onSubmitted={setModalPlacement} showLoginLink={false} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default LandingPage;
