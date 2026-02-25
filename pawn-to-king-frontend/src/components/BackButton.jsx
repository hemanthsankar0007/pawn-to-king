import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

const hasBrowserHistory = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.history.length > 1;
};

function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/home") {
    return null;
  }

  if (!hasBrowserHistory()) {
    return null;
  }

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onClick={() => navigate(-1)}
      className="back-button"
      aria-label="Go back"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M14.5 6.5L9 12L14.5 17.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}

export default BackButton;
