import { useEffect, useState } from "react";
import type { GeneratedRecipe } from "../hooks/useRecipeStream";
import { useToggleFavorite } from "../hooks/useToggleFavorite";

const sections = ["title", "description", "meta", "ingredients", "steps"] as const;

interface RecipeDisplayProps {
  recipe: GeneratedRecipe;
  recipeId?: number;
  isFavorite?: boolean;
}

export default function RecipeDisplay({ recipe, recipeId, isFavorite = false }: RecipeDisplayProps) {
  const { addFavorite, removeFavorite } = useToggleFavorite();
  const [visibleIndex, setVisibleIndex] = useState(-1);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleIndex(-1);
    sections.forEach((_, i) => {
      setTimeout(() => setVisibleIndex(i), i * 400);
    });
  }, [recipe]);

  const visible = (index: number) => index <= visibleIndex;

  return (
    <div>
      <style>{`
        .fade-section {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .fade-section.show {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className={`fade-section ${visible(0) ? "show" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "var(--text-h)" }}>{recipe.title}</h2>
          {recipeId && (
            <button
              onClick={() =>
                isFavorite
                  ? removeFavorite.mutate(recipeId)
                  : addFavorite.mutate(recipeId)
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "28px",
                lineHeight: 1,
                padding: 0,
                color: isFavorite ? "var(--accent)" : "var(--text)",
                transition: "transform 0.2s",
              }}
              title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {isFavorite ? "♥" : "♡"}
            </button>
          )}
        </div>
      </div>

      <div className={`fade-section ${visible(1) ? "show" : ""}`}>
        <p style={{ color: "var(--text)" }}>{recipe.description}</p>
      </div>

      <div className={`fade-section ${visible(2) ? "show" : ""}`}>
        <p style={{ color: "var(--text)" }}>⏱ {recipe.cookingTimeMinutes} min — 🍽 {recipe.servings} porciones</p>
      </div>

      <div className={`fade-section ${visible(3) ? "show" : ""}`}>
        <h3 style={{ color: "var(--text-h)" }}>Ingredientes</h3>
        <ul style={{ color: "var(--text)" }}>
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>{ing.quantity ? `${ing.quantity} ${ing.unit}` : "a gusto"} — {ing.name}</li>
          ))}
        </ul>
      </div>

      <div className={`fade-section ${visible(4) ? "show" : ""}`}>
        <h3 style={{ color: "var(--text-h)" }}>Pasos</h3>
        {recipe.steps.map((step, i) => (
          <p key={i} style={{ color: "var(--text)" }}><strong>{i + 1}-</strong> {step}</p>
        ))}
      </div>
    </div>
  );
}