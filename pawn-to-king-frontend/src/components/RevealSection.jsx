import { motion } from "framer-motion";

function RevealSection({ children, className = "", delay = 0, amount = 0.2, ...rest }) {
  return (
    <motion.section
      {...rest}
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.section>
  );
}

export default RevealSection;
