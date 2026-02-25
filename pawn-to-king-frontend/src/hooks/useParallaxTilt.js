import { useEffect, useMemo, useRef, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";

function useParallaxTilt(strength = 18) {
  const containerRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, { stiffness: 120, damping: 20, mass: 0.45 });
  const smoothY = useSpring(rawY, { stiffness: 120, damping: 20, mass: 0.45 });

  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") {
        setEnabled(false);
        return;
      }

      const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      setEnabled(hasFinePointer && isDesktop);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handlers = useMemo(
    () => ({
      onMouseMove: (event) => {
        if (!enabled || !containerRef.current) {
          return;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = event.clientX - (rect.left + rect.width / 2);
        const relativeY = event.clientY - (rect.top + rect.height / 2);
        rawX.set((relativeX / rect.width) * strength);
        rawY.set((relativeY / rect.height) * strength);
      },
      onMouseLeave: () => {
        rawX.set(0);
        rawY.set(0);
      }
    }),
    [enabled, rawX, rawY, strength]
  );

  return {
    containerRef,
    enabled,
    style: { x: smoothX, y: smoothY },
    handlers
  };
}

export default useParallaxTilt;
