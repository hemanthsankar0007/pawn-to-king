import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

function MagneticWrapper({ children, className = "", strength = 4 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 210, damping: 18, mass: 0.45 });
  const smoothY = useSpring(y, { stiffness: 210, damping: 18, mass: 0.45 });

  const handleMouseMove = (event) => {
    if (!ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    x.set((offsetX / rect.width) * strength * 2);
    y.set((offsetY / rect.height) * strength * 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: smoothX, y: smoothY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

export default MagneticWrapper;
