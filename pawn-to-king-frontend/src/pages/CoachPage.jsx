import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import coachImage from "../../assets/Hemanth .jpg";

const achievements = [
  { label: "4× State Champion", icon: "♛" },
  { label: "3× National University Champion", icon: "♜" },
  { label: "Peak FIDE Rating: 1965", icon: "♞" },
  { label: "100+ Students Trained", icon: "♟" },
];

function AchievementMedal({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.1 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, rotateY: 5, scale: 1.03 }}
      className="group relative cursor-default overflow-hidden rounded-xl border border-gold/25 px-5 py-4"
      style={{
        transformStyle: "preserve-3d",
        background: "linear-gradient(135deg, rgba(212,175,55,0.10) 0%, rgba(11,15,25,0.7) 60%, rgba(212,175,55,0.04) 100%)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.15)",
      }}
    >
      {/* shine sweep */}
      <span
        className="pointer-events-none absolute inset-0 translate-x-[-110%] bg-[linear-gradient(105deg,transparent_40%,rgba(212,175,55,0.12)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-[110%]"
      />
      <p className="font-display text-2xl text-gold/70">{item.icon}</p>
      <p className="mt-1 text-sm font-semibold leading-snug text-text/90">{item.label}</p>
    </motion.div>
  );
}

function CoachPage() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);

  const textInView = useInView(textRef, { once: true, amount: 0.15 });
  const imageInView = useInView(imageRef, { once: true, amount: 0.15 });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const auraY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const silhouetteY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const imageParallax = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section
      ref={sectionRef}
      className="relative flex w-full min-h-[85svh] items-center overflow-hidden sm:min-h-screen"
      style={{
        background: "linear-gradient(135deg, #0a0f1d 0%, #0e1628 40%, #0a0f1d 100%)",
      }}
    >
      {/* Layer 1 — radial gold aura */}
      <motion.div
        style={{ y: auraY }}
        className="pointer-events-none absolute right-[-5%] top-[10%] hidden h-[70vh] w-[55vw] md:block"
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 70% 40%, rgba(212,175,55,0.13), transparent 55%)",
          }}
        />
      </motion.div>

      {/* Layer 2 — chess king silhouette */}
      <motion.div
        style={{ y: silhouetteY }}
        className="pointer-events-none absolute left-[38%] top-[5%] hidden select-none sm:block"
        aria-hidden="true"
      >
        <span
          style={{
            fontSize: "clamp(18rem, 28vw, 38rem)",
            lineHeight: 1,
            opacity: 0.03,
            filter: "blur(2px)",
            display: "block",
            animation: "spin 40s linear infinite",
            color: "#d4af37",
            fontFamily: "serif",
          }}
        >
          ♚
        </span>
      </motion.div>

      {/* Main content grid */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-24">

          {/* ── IMAGE COLUMN ── */}
          <motion.div
            ref={imageRef}
            style={{ y: imageParallax }}
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            animate={imageInView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="group relative mx-auto w-full max-w-md lg:max-w-none"
          >
            {/* gold ambient glow behind */}
            <div
              className="pointer-events-none absolute inset-[-12%] -z-10"
              style={{
                background: "radial-gradient(circle, rgba(212,175,55,0.22), transparent 62%)",
                filter: "blur(80px)",
              }}
            />

            {/* image wrapper */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.2)",
              }}
            >
              <img
                src={coachImage}
                alt="Coach Hemanth Sankar"
                width="1000"
                height="1000"
                loading="lazy"
                className="block w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
                style={{ maxHeight: "68vh", objectPosition: "center 18%" }}
              />

              {/* vignette overlay */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,15,29,0.55) 0%, transparent 45%), linear-gradient(to right, rgba(10,15,29,0.3) 0%, transparent 40%), linear-gradient(to left, rgba(10,15,29,0.3) 0%, transparent 40%)",
                }}
              />

              {/* gold rim light */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.25)",
                }}
              />

              {/* glass panel overlay at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 px-5 py-4"
                style={{
                  background: "linear-gradient(to top, rgba(10,15,29,0.80), transparent)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <p className="font-display text-lg tracking-widest text-gold/80">HEMANTH SANKAR</p>
                <p className="text-xs uppercase tracking-[0.22em] text-text/55">Chess Coach · FIDE Rated</p>
              </div>
            </div>
          </motion.div>

          {/* ── TEXT COLUMN ── */}
          <motion.div
            ref={textRef}
            initial={{ opacity: 0, x: 60 }}
            animate={textInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={textInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xs uppercase tracking-[0.35em] text-gold/70"
            >
              About the Coach
            </motion.p>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={textInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="mt-4 font-display text-[clamp(2.8rem,5vw,5rem)] font-bold leading-[1.05] tracking-tight text-text"
              style={{ textShadow: "0 0 60px rgba(212,175,55,0.12)" }}
            >
              Hemanth{" "}
              <span className="text-gold">Sankar</span>
            </motion.h1>

            {/* Animated gold underline */}
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={textInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 h-px w-48 origin-left"
              style={{
                background: "linear-gradient(to right, #d4af37, rgba(212,175,55,0.2))",
              }}
            />

            {/* Bio */}

            {/* Email */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={textInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-5 text-sm text-text/55"
            >
              <a
                href="mailto:hemanthsankarreddy@gmail.com"
                className="group/email relative inline-block text-gold/80 transition-all duration-300 hover:text-gold hover:brightness-125"
              >
                hemanthsankarreddy@gmail.com
                <span className="absolute bottom-0 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover/email:w-full" />
              </a>
            </motion.p>

            {/* Profile Icons */}
            <div className="mt-5 flex flex-wrap items-center gap-4 sm:gap-5">
              {[
                {
                  label: "Chess.com",
                  href: "https://www.chess.com/member/hemanthsankar",
                  delay: 0.55,
                  svg: (
                    <svg viewBox="0 0 48 48" fill="none" className="h-5 w-5" aria-hidden="true">
                      <text y="36" fontSize="32" fontFamily="serif" fill="#d4af37">♟</text>
                    </svg>
                  ),
                },
                {
                  label: "Lichess",
                  href: "https://lichess.org/@/Hemanthsankar",
                  delay: 0.65,
                  svg: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
                    </svg>
                  ),
                },
                {
                  label: "FIDE",
                  href: "https://ratings.fide.com/profile/25675443",
                  delay: 0.75,
                  svg: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ),
                },
              ].map(({ label, href, delay, svg }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} Profile`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={textInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay, ease: "easeOut" }}
                  whileHover={{ y: -5, scale: 1.08 }}
                  className="group/icon relative flex items-center justify-center"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: "linear-gradient(145deg, rgba(212,175,55,0.10), rgba(11,15,25,0.85))",
                    border: "1px solid rgba(212,175,55,0.35)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(212,175,55,0.12)",
                    transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(212,175,55,0.35), 0 0 0 1px rgba(212,175,55,0.55), inset 0 1px 0 rgba(212,175,55,0.2)";
                    e.currentTarget.style.borderColor = "rgba(212,175,55,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(212,175,55,0.12)";
                    e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)";
                  }}
                >
                  {/* shimmer shine sweep */}
                  <span className="pointer-events-none absolute inset-0 translate-x-[-110%] rounded-full bg-[linear-gradient(105deg,transparent_35%,rgba(212,175,55,0.18)_50%,transparent_65%)] transition-transform duration-700 group-hover/icon:translate-x-[110%]" />

                  {/* tooltip */}
                  <span
                    className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-[10px] uppercase tracking-widest text-gold/80 opacity-0 transition-all duration-300 group-hover/icon:-translate-y-1 group-hover/icon:opacity-100"
                    style={{
                      background: "rgba(11,15,25,0.85)",
                      border: "1px solid rgba(212,175,55,0.2)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {label}
                  </span>

                  <span className="text-gold/75 transition-colors duration-300 group-hover/icon:text-gold">
                    {svg}
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Achievements */}
            <div className="mt-10">
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-text/45">Achievements</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {achievements.map((item, i) => (
                  <AchievementMedal key={item.label} item={item} index={i} />
                ))}
              </div>
            </div>

            {/* Quote */}
            <motion.blockquote
              initial={{ opacity: 0, y: 10 }}
              animate={textInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="mt-10 border-l-2 border-gold/30 pl-5 font-display text-lg italic leading-relaxed text-gold/40"
            >
              "Mastery is not a move. It is a mindset."
            </motion.blockquote>
          </motion.div>
        </div>
      </div>

      {/* Bottom divider */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-40"
        style={{ background: "linear-gradient(to right, transparent, #d4af37, transparent)" }}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}

export default CoachPage;
