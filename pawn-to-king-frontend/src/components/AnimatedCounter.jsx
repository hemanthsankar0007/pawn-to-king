import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function AnimatedCounter({ target, label }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    let rafId;
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, target]);

  return (
    <div ref={ref} className="rounded-xl border border-gold/20 bg-card/70 p-4 text-center">
      <p className="font-display text-3xl text-gold">{value}+</p>
      <p className="mt-2 text-sm text-text/80">{label}</p>
    </div>
  );
}

export default AnimatedCounter;

