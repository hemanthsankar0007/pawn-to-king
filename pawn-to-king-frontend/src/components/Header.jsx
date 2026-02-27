import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { changeUserPassword } from "../api/apiService";
import StatusMessage from "./StatusMessage";
import { setFlashMessage } from "../utils/flashMessage";
import logo from "../../assets/logo.png";

const navLinkClass = ({ isActive }) =>
  `transition-colors duration-300 ease-in-out ${
    isActive ? "text-gold" : "text-text/85 hover:text-gold-hover"
  }`;

const mobileNavLinkClass = ({ isActive }) =>
  `text-lg font-semibold transition-colors duration-200 ${
    isActive ? "text-gold" : "text-text/80 hover:text-gold"
  }`;

const commonLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/coach", label: "About" },
  { to: "/curriculum", label: "Curriculum" }
];

function HamburgerIcon({ open }) {
  return (
    <div className="flex h-5 w-6 flex-col justify-between">
      <span
        className={`block h-0.5 w-full rounded-full bg-gold transition-all duration-300 ${
          open ? "translate-y-[9px] rotate-45" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-full rounded-full bg-gold transition-all duration-300 ${
          open ? "opacity-0 scale-x-0" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-full rounded-full bg-gold transition-all duration-300 ${
          open ? "-translate-y-[9px] -rotate-45" : ""
        }`}
      />
    </div>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const { isAuthenticated, profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = () => {
    setFlashMessage({ type: "info", text: "Logged out successfully." });
    logout();
    setMenuOpen(false);
    setPasswordModalOpen(false);
    navigate("/login", { replace: true });
  };

  const openPasswordModal = () => {
    setPasswordMessage(null);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (passwordBusy) {
      return;
    }
    setPasswordModalOpen(false);
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const currentPassword = String(passwordForm.currentPassword || "").trim();
    const newPassword = String(passwordForm.newPassword || "").trim();
    const confirmPassword = String(passwordForm.confirmPassword || "").trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Please fill all password fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirm password must match." });
      return;
    }

    try {
      setPasswordBusy(true);
      setPasswordMessage(null);
      const response = await changeUserPassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      setPasswordMessage({
        type: "success",
        text: response?.message || "Password updated successfully."
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      try {
        await refreshProfile();
      } catch (_error) {
        // Password update already succeeded; ignore non-critical profile refresh issues.
      }
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error?.response?.data?.message || "Unable to update password right now."
      });
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 h-20 border-b border-gold/15 bg-bg/95 backdrop-blur">
        <div className="header h-full">
          {/* Logo */}
          {isAuthenticated ? (
            <div className="flex min-w-0 cursor-default items-center gap-3">
              <img src={logo} alt="Pawn to King logo" className="h-9 w-9 rounded-md object-contain" />
              <span className="truncate font-display text-lg tracking-wide text-gold sm:text-xl">
                Pawn to King
              </span>
            </div>
          ) : (
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <img src={logo} alt="Pawn to King logo" className="h-9 w-9 rounded-md object-contain" />
              <span className="truncate font-display text-lg tracking-wide text-gold sm:text-xl">
                Pawn to King
              </span>
            </Link>
          )}

          {/* Desktop nav */}
          {isAuthenticated ? (
            <div className="hidden items-center gap-3 lg:flex">
              <button
                type="button"
                className={`inline-flex min-h-[2.75rem] items-center rounded-lg px-5 text-sm font-semibold ${
                  profile?.user?.mustChangePassword
                    ? "primary-btn"
                    : "secondary-btn text-gold"
                }`}
                onClick={openPasswordModal}
              >
                Set Password
              </button>
              <button
                type="button"
                className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-5 text-sm font-semibold text-gold"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <nav className="hidden items-center gap-6 text-base lg:flex">
              {commonLinks.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/login" className={navLinkClass}>Login</NavLink>
              <Link
                to="/join"
                className="primary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-5 text-sm font-semibold"
              >
                Join
              </Link>
            </nav>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold/20 lg:hidden"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {/* Mobile slide drawer + overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.nav
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[min(86vw,20rem)] flex-col border-l border-gold/15 bg-bg/98 px-5 pb-8 pt-24 lg:hidden"
            >
              {/* Nav links */}
              <div className="flex flex-col gap-6">
                {!isAuthenticated ? (
                  <>
                    {commonLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={mobileNavLinkClass}
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                    <div className="mt-2 h-px bg-gold/10" />
                    <NavLink to="/login" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                      Login
                    </NavLink>
                    <Link
                      to="/join"
                      onClick={() => setMenuOpen(false)}
                      className="primary-btn inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg text-sm font-semibold"
                    >
                      Join Academy
                    </Link>
                  </>
                ) : (
                  <>
                    <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </NavLink>
                    <div className="mt-2 h-px bg-gold/10" />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        openPasswordModal();
                      }}
                      className="secondary-btn inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg text-sm font-semibold"
                    >
                      Set Password
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="secondary-btn inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-lg text-sm font-semibold"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>

              {/* Footer branding */}
              <div className="mt-auto">
                <p className="text-xs uppercase tracking-[0.16em] text-text/30">Pawn to King</p>
                <p className="mt-1 text-[11px] text-text/20">Chess Academy Portal</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {passwordModalOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/70 p-4 backdrop-blur-sm md:p-8">
          <div className="mx-auto w-full max-w-xl rounded-2xl border border-gold/30 bg-card/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)] md:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.22em] text-gold">Set Password</p>
              <button
                type="button"
                onClick={closePasswordModal}
                className="secondary-btn inline-flex min-h-[2.5rem] items-center rounded-lg px-3 text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <h2 className="font-display text-2xl">Update Account Password</h2>
            <p className="mt-2 text-sm text-text/75">
              {profile?.user?.mustChangePassword
                ? "You are using a temporary password. Set a new password now."
                : "Change your password anytime to keep your account secure."}
            </p>

            <form className="mt-5 grid gap-3" onSubmit={handlePasswordSubmit}>
              <label className="text-xs uppercase tracking-[0.12em] text-text/60">
                Current Password
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    handlePasswordFieldChange("currentPassword", event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
                  autoComplete="current-password"
                  required
                />
              </label>
              <label className="text-xs uppercase tracking-[0.12em] text-text/60">
                New Password
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => handlePasswordFieldChange("newPassword", event.target.value)}
                  className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="text-xs uppercase tracking-[0.12em] text-text/60">
                Confirm Password
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    handlePasswordFieldChange("confirmPassword", event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-gold/20 bg-bg/70 px-3 py-2.5 text-sm outline-none focus:border-gold"
                  autoComplete="new-password"
                  required
                />
              </label>

              <StatusMessage type={passwordMessage?.type || "info"} text={passwordMessage?.text} />

              <button
                type="submit"
                disabled={passwordBusy}
                className="primary-btn mt-1 inline-flex min-h-[2.75rem] items-center justify-center rounded-lg px-5 text-sm font-semibold disabled:opacity-60"
              >
                {passwordBusy ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Header;
