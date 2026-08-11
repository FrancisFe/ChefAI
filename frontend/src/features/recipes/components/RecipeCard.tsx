import { useNavigate } from "react-router-dom";
import { useToggleFavorite } from "../hooks/useToggleFavorite";
import type { RecipeHistoryItem } from "../../../lib/api-client";

export default function RecipeCard({ recipe }: { recipe: RecipeHistoryItem }) {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite } = useToggleFavorite();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (recipe.isFavorite) {
      removeFavorite.mutate(recipe.id);
    } else {
      addFavorite.mutate(recipe.id);
    }
  };

  const dateStr = new Date(recipe.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/recipe/${recipe.id}`);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      onKeyDown={handleKeyDown}
      aria-label={`Ver receta ${recipe.title}`}
      style={{
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "none",
        backgroundColor: recipe.isFavorite ? "var(--accent-bg)" : "var(--bg)",
        cursor: "pointer",
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={{ margin: 0, color: "var(--text-h)" }}>{recipe.title}</h2>
        <button
          onClick={handleFavoriteClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            lineHeight: 1,
            padding: 0,
            color: recipe.isFavorite ? "var(--accent)" : "var(--text)",
            transition: "transform 0.15s",
          }}
          title={recipe.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {recipe.isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <p style={{ fontSize: "13px", color: "var(--text)", margin: "8px 0" }}>{dateStr}</p>
      <p style={{ fontSize: "14px", color: "var(--text)", marginBottom: "12px" }}>
        ⏱ {recipe.cookingTime} min — 🍽 {recipe.servings} porciones
      </p>

      <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "var(--text-h)" }}>Ingredientes:</h3>
      <ul style={{ fontSize: "14px", marginBottom: "12px", color: "var(--text)" }}>
        {recipe.ingredients.map((ing, i) => {
          const quantityText = ing.quantity === null || ing.unit === null ? "A gusto" : `${ing.quantity} ${ing.unit}`;
          return <li key={i}>{quantityText} — {ing.name}</li>;
        })}
      </ul>
    </div>
  );
}
