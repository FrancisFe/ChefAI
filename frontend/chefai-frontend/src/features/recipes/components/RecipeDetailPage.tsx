import { useParams, useNavigate } from "react-router-dom";
import { useRecipeHistory } from "../hooks/useRecipeHistory";
import { useToggleFavorite } from "../hooks/useToggleFavorite";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const recipeId = Number(id);

  const { data: recipes, isLoading, error } = useRecipeHistory();
  const recipe = recipes?.find((r) => r.id === recipeId);
  const { addFavorite, removeFavorite } = useToggleFavorite();

  if (isLoading) {
    return (
      <div className="container">
        <p>Cargando receta...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container">
        <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>
          ← Volver
        </button>
        <p style={{ color: "red" }}>Receta no encontrada.</p>
      </div>
    );
  }

  const steps = recipe.steps ? recipe.steps.split("\n").filter(Boolean) : [];

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>
        ← Volver
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{recipe.title}</h1>
        <button
          onClick={() =>
            recipe.isFavorite
              ? removeFavorite.mutate(recipe.id)
              : addFavorite.mutate(recipe.id)
          }
          style={{
            background: "none",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "18px",
            padding: "8px 16px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
          title={recipe.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {recipe.isFavorite ? "♥" : "♡"}
          {recipe.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        </button>
      </div>

      <p>{recipe.description}</p>

      <p style={{ fontSize: "16px", color: "#666", marginBottom: "16px" }}>
        ⏱ {recipe.cookingTime} min — 🍽 {recipe.servings} porciones
      </p>

      <h3>Ingredientes</h3>
      <ul>
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
          <h3>Pasos</h3>
          {steps.map((step, i) => (
            <p key={i}>
              <strong>{i + 1}-</strong> {step}
            </p>
          ))}
        </>
      )}
    </div>
  );
}
