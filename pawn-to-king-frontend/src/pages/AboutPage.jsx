import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import RevealSection from "../components/RevealSection";

const coachImage =
  "https://images.pexels.com/photos/411207/pexels-photo-411207.jpeg?auto=compress&cs=tinysrgb&w=1200";

function AboutPage() {
  return (
    <PageTransition className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <RevealSection className="glass-card rounded-2xl p-7 md:p-10">
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">About Pawn to King Academy</p>
            <h1 className="mt-3 font-display text-4xl leading-tight">
              Elite Chess Coaching with Structured Progress
            </h1>
            <p className="mt-5 text-text/80">
              Pawn to King Academy is built around a progression model that removes guesswork. Students train through
              focused topics, submit graded homework, and receive level-based classroom access aligned to their growth.
            </p>
            <p className="mt-4 text-text/80">
              Our framework blends tactical sharpness, positional understanding, and competitive discipline so students
              improve consistently across all phases of the game.
            </p>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-2xl border border-gold/25 bg-bg/70"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 36px rgba(212,175,55,0.3)"
            }}
            transition={{ duration: 0.35 }}
          >
            <img src={coachImage} alt="Chess coaching session at a board" className="h-full min-h-72 w-full object-cover" />
            <motion.div
              className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-120%" }}
              whileHover={{ x: "320%" }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </RevealSection>
    </PageTransition>
  );
}

export default AboutPage;
