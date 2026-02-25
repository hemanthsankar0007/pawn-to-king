import { motion } from "framer-motion";

function JoinCtaSection({ onJoin }) {
  return (
    <section className="mt-12 border-t border-gold/10 bg-[linear-gradient(150deg,rgba(212,175,55,0.08),rgba(11,15,25,0.92)_38%,rgba(11,15,25,0.96)_100%)] py-24">
      <div className="home-container flex w-full flex-col text-left">
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,3.4vw,3.4rem)] font-bold leading-[1.15] text-text">
          Ready to Begin Your Ascent?
        </h2>

        <p className="mt-4 max-w-2xl text-[clamp(1rem,1.2vw,1.15rem)] leading-[1.7] text-text/85">
          Join Pawn to King Academy and unlock structured mastery.
        </p>

        {/* Complimentary Demo Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mt-6 inline-block max-w-xl rounded-xl border border-gold/40 bg-gold/10 p-5"
        >
          <span className="text-lg font-semibold tracking-wide text-gold">
            🎓 Complimentary Demo Session Available
          </span>
          <p className="mt-2 text-sm text-gray-300">
            Experience a live class before enrollment. No commitment required.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          type="button"
          onClick={onJoin}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="mt-8 self-start inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
          style={{
            background: "linear-gradient(90deg, #b8952e 0%, #e8c84a 40%, #f5d96b 60%, #d4af37 100%)",
            color: "#0b0f19",
            boxShadow: "0 0 28px rgba(212,175,55,0.35)",
          }}
        >
          Join Now
        </motion.button>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="mt-12 border-t border-gold/20 pt-8 max-w-xl"
        >
          <h4 className="text-xl font-semibold text-gold mb-3">
            Contact Us
          </h4>

          <p className="text-sm text-gray-400 mb-4">
            For enrollment queries, schedule discussion, or demo session booking:
          </p>

          <div className="flex flex-col gap-3">
            <a
              href="mailto:hemanthsankarreddy@gmail.com"
              className="text-base text-gold hover:underline transition-all"
            >
              📧 hemanthsankarreddy@gmail.com
            </a>
            <a
              href="https://wa.me/919398189814"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-gold hover:underline transition-all"
            >
              💬 WhatsApp: +91 9398189814
            </a>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            Direct communication with the academy ensures clarity before enrollment.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default JoinCtaSection;
