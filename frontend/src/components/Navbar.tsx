import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useUiStore from "../store/uiStore";
import { useAdmin } from "../features/auth/hooks/useAdmin";

const personalLinks: LinkItem[] = [
  { to: "/generate-recipe", label: "Generar Receta" },
  { to: "/recipe-history", label: "Mi Historial" },
  { to: "/favorites", label: "Mis Favoritos" },
  { to: "/profile", label: "Mi Perfil" },
];

interface LinkItem {
  to: string;
  label: string;
  end?: boolean;
}

const socialLinks: LinkItem[] = [
  { to: "/challenge", label: "Desafío Activo" },
  { to: "/challenge/leaderboard", label: "Feed" },
  { to: "/challenge/ranking", label: "Ranking Desafío", end: true },
  { to: "/challenge/ranking/total", label: "Ranking Global" },
  { to: "/challenge/history", label: "Historial" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const socialMode = useUiStore((s) => s.socialMode);
  const toggleMode = useUiStore((s) => s.toggleMode);
  const links = socialMode ? socialLinks : personalLinks;

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    textDecoration: "none",
    color: isActive ? "var(--accent)" : "var(--text)",
    background: isActive ? "var(--accent-bg)" : "transparent",
    border: "none",
    cursor: "pointer",
    transition: "color 0.15s, background 0.15s",
  });

  return (
    <nav
      aria-label="Principal"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "12px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          fontSize: "20px",
          fontWeight: 700,
          color: "var(--text-h)",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        ChefAI
      </button>

      <button
        type="button"
        onClick={toggleMode}
        aria-pressed={socialMode}
        style={{
          display: "inline-flex",
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid var(--border)",
          cursor: "pointer",
          userSelect: "none",
          padding: 0,
          background: "transparent",
        }}
      >
        <span
          style={{
            padding: "6px 16px",
            fontSize: "13px",
            fontWeight: 600,
            background: !socialMode ? "var(--accent)" : "transparent",
            color: !socialMode ? "#fff" : "var(--text)",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          Personal
        </span>
        <span
          style={{
            padding: "6px 16px",
            fontSize: "13px",
            fontWeight: 600,
            background: socialMode ? "var(--accent)" : "transparent",
            color: socialMode ? "#fff" : "var(--text)",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          Social
        </span>
      </button>

      <div
        style={{
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} style={navLinkStyle}>
            {link.label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink to="/admin" style={navLinkStyle}>
            Admin
          </NavLink>
        )}
      </div>

      <button
        onClick={() => useAuthStore.getState().logout()}
        style={{
          padding: "8px 14px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 500,
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--text)",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Cerrar sesión
      </button>
    </nav>
  );
}
