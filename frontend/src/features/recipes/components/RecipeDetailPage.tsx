import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRecipeById, type RecipeHistoryItem } from "../../../lib/api-client";
import { useToggleFavorite } from "../hooks/useToggleFavorite";

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  boxShadow: "var(--shadow)",
  padding: "24px",
};

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

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipeId = Number(id);

  const { data: recipe, isLoading, error } = useQuery<RecipeHistoryItem>({
    queryKey: ["recipe", recipeId],
    queryFn: () => getRecipeById(recipeId),
    enabled: !isNaN(recipeId),
  });
  const { addFavorite, removeFavorite } = useToggleFavorite();

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
        <div style={cardStyle}>
          <p style={{ color: "var(--text)" }}>Cargando receta...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div>
        {backButton}
        <div style={cardStyle}>
          <p style={{ color: "#e74c3c" }}>Receta no encontrada.</p>
        </div>
      </div>
    );
  }

  const steps = recipe.steps ? recipe.steps.split("\n").filter(Boolean) : [];

  return (
    <div>
      {backButton}

      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <h1 style={{ margin: 0 }}>{recipe.title}</h1>
          <button
            onClick={() =>
              recipe.isFavorite
                ? removeFavorite.mutate(recipe.id)
                : addFavorite.mutate(recipe.id)
            }
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "18px",
              padding: "8px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--text-h)",
              whiteSpace: "nowrap",
              transition: "box-shadow 0.2s",
            }}
            title={recipe.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {recipe.isFavorite ? "♥" : "♡"}
            {recipe.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          </button>
        </div>

        <p style={{ color: "var(--text)", marginTop: "12px" }}>{recipe.description}</p>

        <p style={{ fontSize: "16px", color: "var(--text)", marginBottom: "16px" }}>
          ⏱ {recipe.cookingTime} min — 🍽 {recipe.servings} porciones
        </p>

        <h2 style={{ color: "var(--text-h)", fontSize: "18px" }}>Ingredientes</h2>
        <ul style={{ color: "var(--text)" }}>
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>
              {ing.quantity === null || ing.unit === null
                ? "A gusto"
                : `${ing.quantity} ${ing.unit}`}
              {" — "}
              {ing.name}
            </li>
          ))}
        </ul>

        {steps.length > 0 && (
          <>
            <h2 style={{ color: "var(--text-h)", fontSize: "18px" }}>Pasos</h2>
            {steps.map((step, i) => (
              <p key={i} style={{ color: "var(--text)" }}>
                <strong>{i + 1}-</strong> {step}
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
