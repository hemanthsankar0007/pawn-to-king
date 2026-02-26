import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedCounter from "./AnimatedCounter";
import coachImage from "../../assets/Hemanth .jpg";

function AboutCoach() {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const [inView, setInView] = useState(false);

  // Scroll-based visibility
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animate SVG arm strokes
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.querySelectorAll(".social-arm").forEach((path) => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = inView ? 0 : len;
    });
  }, [inView]);

  return (
    <section id="about-section" className="coach-section">
      <div className="coach-grid">
        <div
          ref={wrapperRef}
          className={`coach-image-wrapper${inView ? " in-view" : ""}`}
        >
          <img src={coachImage} alt="Hemanth Sankar" width="1000" height="1000" loading="lazy" />

          {/* Doc Ock tentacle arms — L-shaped, start from image border */}
          <svg
            ref={svgRef}
            className="social-arms-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Chess: exits left border at top-third, goes left then turns UP */}
            <path className="social-arm arm-chess" d="M 0,30 H -11 V 23" />
            {/* Lichess: exits left border at mid, goes left then turns DOWN */}
            <path className="social-arm arm-lichess" d="M 0,50 H -11 V 58" />
            {/* FIDE: exits right border, goes right then turns UP */}
            <path className="social-arm arm-fide" d="M 100,40 H 108 V 33" />
          </svg>

          <a
            href="https://www.chess.com/member/hemanthsankar"
            target="_blank"
            rel="noreferrer"
            className="social-icon chess"
            aria-label="Chess.com"
          >
            C
          </a>

          <a
            href="https://lichess.org/@/Hemanthsankar"
            target="_blank"
            rel="noreferrer"
            className="social-icon lichess"
            aria-label="Lichess"
          >
            L
          </a>

          <a
            href="https://ratings.fide.com/profile/25675443"
            target="_blank"
            rel="noreferrer"
            className="social-icon fide"
            aria-label="FIDE"
          >
            F
          </a>
        </div>

        <div className="coach-text">
          <h2 className="font-display text-[clamp(2.15rem,3.2vw,3.4rem)] leading-tight">Hemanth Sankar</h2>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatedCounter target={100} label="Students" />
            <AnimatedCounter target={5} label="Years Coaching" />
            <AnimatedCounter target={10} label="Major Titles" />
          </div>
          <div className="mt-6">
            <Link
              to="/coach"
              className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 text-xs font-semibold"
            >
              View Full Profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutCoach;
