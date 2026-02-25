import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { setFlashMessage } from "../utils/flashMessage";
import logo from "../../assets/logo.png";

const navLinkClass = ({ isActive }) =>
  `transition-colors duration-300 ease-in-out ${
    isActive ? "text-gold" : "text-text/85 hover:text-gold-hover"
  }`;

const commonLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/coach", label: "About" },
  { to: "/curriculum", label: "Curriculum" }
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      setMenuOpen(false);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setFlashMessage({ type: "info", text: "Logged out successfully." });
    logout();
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-20 border-b border-gold/15 bg-bg/95 backdrop-blur">
      <div className="header h-full">
        {isAuthenticated ? (
          <div className="flex min-w-0 cursor-default items-center gap-3">
            <img src={logo} alt="Pawn to King logo" className="h-10 w-10 rounded-md object-contain" />
            <span className="font-display text-xl tracking-wide text-gold">Pawn to King</span>
          </div>
        ) : (
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src={logo} alt="Pawn to King logo" className="h-10 w-10 rounded-md object-contain" />
            <span className="font-display text-xl tracking-wide text-gold">Pawn to King</span>
          </Link>
        )}

        {isAuthenticated ? (
          <button
            type="button"
            className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-5 text-sm font-semibold text-gold"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <button
              type="button"
              className="secondary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-3 text-xs md:hidden"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
            >
              Menu
            </button>

            <nav className="hidden items-center gap-7 text-base md:flex">
              {commonLinks.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <Link
                to="/join"
                className="primary-btn inline-flex min-h-[2.75rem] items-center rounded-lg px-5 text-sm font-semibold"
              >
                Join
              </Link>
            </nav>
          </>
        )}
      </div>

      {!isAuthenticated && menuOpen && (
        <nav className="border-t border-gold/15 bg-bg/95 md:hidden">
          <div className="header-mobile flex flex-col gap-3 py-4 text-sm">
            {commonLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/login" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Login
            </NavLink>
            <NavLink to="/join" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Join
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;
