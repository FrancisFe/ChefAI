import { useNavigate } from "react-router-dom";
import type { RecipeHistoryItem } from "../../../lib/api-client";
import RecipeCard from "./RecipeCard";

interface RecipeListProps {
  recipes: RecipeHistoryItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  title: string;
  emptyMessage: string;
  showFavoritesLink?: boolean;
}

const backButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--text)",
  cursor: "pointer",
  fontSize: "15px",
  padding: "0",
  marginBottom: "16px",
  transition: "color 0.2s",
};

export default function RecipeList({ recipes, isLoading, error, title, emptyMessage, showFavoritesLink }: RecipeListProps) {
  const navigate = useNavigate();

  const backButton = (
    <button
      onClick={() => navigate(-1)}
      style={backButtonStyle}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
    >
      ← Volver
    </button>
  );

  if (isLoading) {
    return (
      <div>
        {backButton}
        <p style={{ color: "var(--text)" }}>Cargando recetas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {backButton}
        <p style={{ color: "#e74c3c" }}>Error al cargar recetas: {error.message}</p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div>
        {backButton}
        <h1>{title}</h1>
        <p style={{ color: "var(--text)" }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {backButton}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "12px" }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        {showFavoritesLink && (
          <button
            onClick={() => navigate("/favorites")}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-h)",
              cursor: "pointer",
              padding: "8px 16px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              transition: "box-shadow 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow)";
              e.currentTarget.style.borderColor = "var(--accent-border)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            Ir a Favoritos
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
