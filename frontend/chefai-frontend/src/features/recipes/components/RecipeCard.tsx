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

  return (
    <div
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        backgroundColor: recipe.isFavorite ? "#fff9e6" : "#fff",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={{ margin: 0 }}>{recipe.title}</h2>
        <button
          onClick={handleFavoriteClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            lineHeight: 1,
            padding: 0,
          }}
          title={recipe.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {recipe.isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <p style={{ fontSize: "13px", color: "#888", margin: "8px 0" }}>{dateStr}</p>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
        ⏱ {recipe.cookingTime} min — 🍽 {recipe.servings} porciones
      </p>

      <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Ingredientes:</h3>
      <ul style={{ fontSize: "14px", marginBottom: "12px" }}>
        {recipe.ingredients.map((ing, i) => {
          const quantityText = ing.quantity === null || ing.unit === null ? "A gusto" : `${ing.quantity} ${ing.unit}`;
          return <li key={i}>{quantityText} — {ing.name}</li>;
        })}
      </ul>
    </div>
  );
}
