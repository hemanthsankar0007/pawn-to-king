import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { setFlashMessage } from "../utils/flashMessage";
import logo from "../../assets/logo.png";

const navLinkClass = ({ isActive }) =>
  `transition-colors duration-200 ${
    isActive ? "text-gold" : "text-text/80 hover:text-gold-hover"
  }`;

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-bg/95 backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-4 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Pawn to King logo" className="h-9 w-9 rounded-md object-contain" />
          <span className="font-display text-xl tracking-wide text-gold">Pawn to King</span>
        </Link>

        <button
          type="button"
          className="rounded-md border border-gold/30 px-3 py-1 text-xs text-text md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          Menu
        </button>

        <nav className="hidden items-center gap-8 text-base md:flex">
          {!isAuthenticated && (
            <>
              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>
              <NavLink to="/curriculum" className={navLinkClass}>
                Curriculum
              </NavLink>
            </>
          )}
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <button
                type="button"
                className="rounded-md border border-gold/40 px-4 py-1.5 text-sm text-gold hover:border-gold-hover hover:text-gold-hover"
                onClick={() => {
                  setFlashMessage({ type: "info", text: "Logged out successfully." });
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <Link
                to="/join"
                className="rounded-md border border-gold/45 px-4 py-1.5 text-sm text-gold transition-colors hover:border-gold-hover hover:text-gold-hover"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>

      {menuOpen && (
        <nav className="border-t border-gold/15 px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3 text-sm">
            {!isAuthenticated && (
              <>
                <NavLink to="/about" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  About
                </NavLink>
                <NavLink to="/curriculum" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Curriculum
                </NavLink>
              </>
            )}
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Dashboard
                </NavLink>
                <button
                  type="button"
                  className="w-fit rounded-md border border-gold/40 px-3 py-1 text-xs text-gold"
                  onClick={() => {
                    setFlashMessage({ type: "info", text: "Logged out successfully." });
                    logout();
                    navigate("/login", { replace: true });
                    setMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Login
                </NavLink>
                <NavLink to="/join" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Join
                </NavLink>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
