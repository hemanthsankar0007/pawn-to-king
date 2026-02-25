import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { setFlashMessage } from "../utils/flashMessage";
import logo from "../../assets/logo.png";

const baseLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/curriculum", label: "Curriculum" },
  { to: "/homework", label: "Homework" },
  { to: "/classroom", label: "Classroom" },
  { to: "/timetable", label: "Timetable" },
  { to: "/bonus", label: "Bonus" }
];

const adminLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/classroom", label: "Classroom" },
  { to: "/admin", label: "Admin" },
  { to: "/admin/batches", label: "Batches" },
  { to: "/admin/timetable", label: "Admin Timetable" },
  { to: "/admin/curriculum", label: "Curriculum" },
  { to: "/admin/config", label: "Config" }
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm transition-colors duration-300 ease-in-out ${
    isActive ? "bg-gold/15 text-gold" : "text-text/80 hover:bg-card hover:text-gold-hover"
  }`;

function SidebarContent({ userName, links, onNavigate, onLogout }) {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Pawn to King logo" className="h-10 w-10 rounded-md object-contain" />
          <p className="font-display text-lg tracking-wide text-gold">Pawn to King</p>
        </div>
        <p className="mt-2 text-xs uppercase tracking-widest text-text/60">Academy Portal</p>
      </div>

      <div className="mb-6 rounded-xl border border-gold/20 bg-bg/70 p-4">
        <p className="text-xs text-text/60">Logged in as</p>
        <p className="mt-1 font-medium text-text">{userName}</p>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass} onClick={onNavigate}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="secondary-btn mt-auto min-h-[2.75rem] rounded-lg px-3 text-sm text-gold"
      >
        Logout
      </button>
    </>
  );
}

function Sidebar({ isOpen, onClose }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const userName = profile?.user?.name || "Student";
  const links =
    profile?.user?.role === "admin"
      ? adminLinks
      : baseLinks;

  const handleLogout = () => {
    setFlashMessage({ type: "info", text: "Logged out successfully." });
    logout();
    onClose?.();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <aside className="fixed left-0 top-20 z-30 hidden h-[calc(100vh-5rem)] w-72 border-r border-gold/15 bg-card/85 p-6 backdrop-blur lg:flex lg:flex-col">
        <SidebarContent
          userName={userName}
          links={links}
          onNavigate={() => undefined}
          onLogout={handleLogout}
        />
      </aside>

      <div
        className={`fixed inset-0 top-20 z-40 bg-black/45 transition-opacity duration-300 ease-in-out lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-20 z-50 flex h-[calc(100vh-5rem)] w-72 flex-col border-r border-gold/20 bg-card/95 p-6 backdrop-blur transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent userName={userName} links={links} onNavigate={onClose} onLogout={handleLogout} />
      </aside>
    </>
  );
}

export default Sidebar;
