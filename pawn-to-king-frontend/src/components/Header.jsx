import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
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
  const { isAuthenticated, logout } = useAuth();
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
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 h-20 border-b border-gold/15 bg-bg/95 backdrop-blur">
        <div className="header h-full">
          {/* Logo */}
          {isAuthenticated ? (
            <div className="flex min-w-0 cursor-default items-center gap-3">
              <img src={logo} alt="Pawn to King logo" className="h-9 w-9 rounded-md object-contain" />
              <span className="font-display text-xl tracking-wide text-gold">Pawn to King</span>
            </div>
          ) : (
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <img src={logo} alt="Pawn to King logo" className="h-9 w-9 rounded-md object-contain" />
              <span className="font-display text-xl tracking-wide text-gold">Pawn to King</span>
            </Link>
          )}

          {/* Desktop nav */}
          {isAuthenticated ? (
            <button
              type="button"
              className="secondary-btn hidden min-h-[2.75rem] items-center rounded-lg px-5 text-sm font-semibold text-gold md:inline-flex"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <nav className="hidden items-center gap-7 text-base md:flex">
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
              className="fixed right-0 top-0 z-50 flex h-full w-72 max-w-[80vw] flex-col border-l border-gold/15 bg-bg/98 px-6 pb-10 pt-24 lg:hidden"
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
    </>
  );
}

export default Header;

