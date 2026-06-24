import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRecipeStream } from "../hooks/useRecipeStream";
import { useDetectIngredients } from "../hooks/useDetectIngredients";
import { useRecipeHistory } from "../hooks/useRecipeHistory";
import { useToggleFavorite } from "../hooks/useToggleFavorite";
import RecipeDisplay from "./RecipeDisplay";
import RestrictionsChips from "./RestrictionsChips";

export default function RecipeGeneratorPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [servings, setServings] = useState(1);
  const [maxCookingTimeMinutes, setMaxCookingTimeMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState("easy");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { recipe, isStreaming, error, gamificationResult, startStream } = useRecipeStream();
  const { detectFromImage, isDetecting, error: detectError } = useDetectIngredients();
  const { data: historyRecipes } = useRecipeHistory();
  const { addFavorite, removeFavorite } = useToggleFavorite();

  const match = useMemo(() => {
    if (!recipe || !historyRecipes) return null;
    return historyRecipes.find((r) => r.title === recipe.title) ?? null;
  }, [recipe, historyRecipes]);

  useEffect(() => {
    if (!isStreaming && recipe) {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    }
  }, [isStreaming, recipe, queryClient]);

  useEffect(() => {
    if (!gamificationResult) return;

    if (gamificationResult.pointsEarned > 0) {
      toast.success(`+${gamificationResult.pointsEarned} puntos`, {
        description: `Nivel ${gamificationResult.currentLevel} — ${gamificationResult.totalPoints} pts totales`,
        duration: 4000,
      });
    }

    for (const badge of gamificationResult.badges) {
      toast.custom(
        (_t) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid var(--accent-border)",
              background: "var(--accent-bg)",
              boxShadow: "var(--shadow)",
            }}
          >
            <span style={{ fontSize: "32px" }}>🏅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-h)" }}>
                ¡Nuevo badge desbloqueado!
              </div>
              <div style={{ fontSize: "13px", color: "var(--text)", marginTop: "2px" }}>
                {badge.badgeName ?? ""}
              </div>
            </div>
          </div>
        ),
        { duration: 6000 }
      );
    }
  }, [gamificationResult]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mostrar preview de la imagen
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Detectar ingredientes
    const detectedIngredients = await detectFromImage(file);
    if (detectedIngredients.length > 0) {
      setInput(detectedIngredients.join(", "));
    }
  };

  const handleGenerate = () => {
    if (!input.trim()) return;

    const ingredients = input
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    if (!ingredients.length) return;

    startStream({
      ingredients,
      servings,
      maxCookingTimeMinutes,
      difficulty,
    });
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>← Volver</button>
      <h1>Generar Receta</h1>

      <div style={{ marginBottom: "20px", padding: "20px", border: "2px dashed #ccc", borderRadius: "8px" }}>
        <h3>Detectar ingredientes desde imagen</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isDetecting}
        />
        {isDetecting && <p style={{ color: "blue" }}>Detectando ingredientes...</p>}
        {detectError && <p style={{ color: "red" }}>Error: {detectError}</p>}
        {imagePreview && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px" }}
            />
          </div>
        )}
      </div>

      <textarea
        placeholder="Ej: pollo, arroz, cebolla"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <RestrictionsChips />

      <input
        type="number"
        min={1}
        placeholder="Porciones"
        value={servings}
        onChange={(e) => setServings(Number(e.target.value))}
      />

      <input
        type="number"
        min={1}
        placeholder="Tiempo máximo (minutos)"
        value={maxCookingTimeMinutes}
        onChange={(e) => setMaxCookingTimeMinutes(Number(e.target.value))}
      />

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option value="easy">Fácil</option>
        <option value="medium">Media</option>
        <option value="hard">Difícil</option>
      </select>

      <button onClick={handleGenerate} disabled={isStreaming}>
        {isStreaming ? "Generando..." : "Generar"}
      </button>

      {error && <p>{error}</p>}

      <div style={{ marginTop: "20px" }}>
        {isStreaming && (
  <p>Generando receta...</p>
)}

{!isStreaming && recipe && (
  <>
    <RecipeDisplay recipe={recipe} recipeId={match?.id} isFavorite={match?.isFavorite ?? false} />
    {match && (
      <div style={{ marginTop: "12px" }}>
        <button
          onClick={() =>
            match.isFavorite
              ? removeFavorite.mutate(match.id)
              : addFavorite.mutate(match.id)
          }
          style={{
            background: "none",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "20px",
            padding: "8px 16px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
          title={match.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {match.isFavorite ? "♥" : "♡"}
          {match.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        </button>
      </div>
    )}
  </>
)}
      </div>
    </div>
  );
}
