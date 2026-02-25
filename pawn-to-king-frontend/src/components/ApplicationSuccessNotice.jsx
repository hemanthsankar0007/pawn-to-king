import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function ApplicationSuccessNotice({
  onSubmitAnother,
  onDone,
  doneLabel = "Done",
  showLoginLink = false
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-gold/35 bg-card/85 p-6 shadow-[0_0_0_1px_rgba(212,175,55,0.2),0_18px_45px_rgba(0,0,0,0.35),0_0_26px_rgba(212,175,55,0.12)] md:p-8"
    >
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-gold/45 bg-gold/10 text-sm text-gold">
        {"\u265E"}
      </div>
      <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-gold">Application Submitted</p>
      <h2 className="mt-2 text-center font-display text-[clamp(1.5rem,2.3vw,2rem)] text-text">
        {"Application Received Successfully \u{1F389}"}
      </h2>

      <p className="mt-4 text-center text-sm leading-[1.75] text-text/85">
        Thank you for applying to Pawn to King Academy.
        <br />
        <br />
        Our team will carefully review the application and contact you soon via email.
      </p>

      <p className="mt-5 text-center text-sm italic leading-[1.7] text-gold/85">
        We look forward to building discipline and confidence
        <br />
        - Coach Hemanth Sankar
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onSubmitAnother}
          className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 text-xs font-semibold"
        >
          Submit Another Application
        </button>
        {showLoginLink ? (
          <Link
            to="/login"
            className="primary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 text-xs font-semibold"
          >
            Go to Login
          </Link>
        ) : (
          <button
            type="button"
            onClick={onDone}
            className="primary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-4 text-xs font-semibold"
          >
            {doneLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default ApplicationSuccessNotice;
