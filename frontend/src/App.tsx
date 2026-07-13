import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import useUiStore from "./store/uiStore";
import { useNavigate } from "react-router-dom";
import './App.css'

function App() {
  const syncAuthState = useAuthStore((s) => s.syncAuthState);
  const socialMode = useUiStore((s) => s.socialMode);
  const navigate = useNavigate();

  useEffect(() => {
    syncAuthState();
  }, [syncAuthState]);

  const personalActions = [
    { label: "Generar Receta", icon: "🍳", to: "/generate-recipe" },
    { label: "Mi Historial", icon: "📋", to: "/recipe-history" },
    { label: "Mis Favoritos", icon: "❤️", to: "/favorites" },
    { label: "Mi Perfil", icon: "👤", to: "/profile" },
  ];

  const socialActions = [
    { label: "Desafío Activo", icon: "⭐", to: "/challenge" },
    { label: "Feed", icon: "🍴", to: "/challenge/leaderboard" },
    { label: "Ranking Desafío", icon: "🏆", to: "/challenge/ranking" },
    { label: "Ranking Global", icon: "🌍", to: "/challenge/ranking/total" },
    { label: "Historial", icon: "📜", to: "/challenge/history" },
  ];

  const actions = socialMode ? socialActions : personalActions;

  return (
    <div style={{ textAlign: "center", paddingTop: "40px" }}>
      <h1 style={{ fontSize: "32px", color: "var(--text-h)" }}>
        {socialMode ? "Modo Social" : "ChefAI"}
      </h1>
      <p style={{ color: "var(--text)", marginBottom: "32px" }}>
        {socialMode
          ? "Participá en desafíos, votá recetas y subí en el ranking"
          : "Generá recetas con IA, guardá tus favoritas y personalizá tu perfil"}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {actions.map((action) => (
          <button
            key={action.to}
            onClick={() => navigate(action.to)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              padding: "28px 16px",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              background: "var(--bg)",
              cursor: "pointer",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-border)";
              e.currentTarget.style.boxShadow = "var(--shadow)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span style={{ fontSize: "36px" }}>{action.icon}</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-h)" }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;