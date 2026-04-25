import { useState } from "react";
import { useRecipeStream } from "../hooks/useRecipeStream";
import RecipeDisplay from "./RecipeDisplay";

export default function RecipeGeneratorPage() {
  const [input, setInput] = useState("");
  const [servings, setServings] = useState(1);
  const [maxCookingTimeMinutes, setMaxCookingTimeMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState("easy");

  const {recipe, isStreaming, error, startStream } = useRecipeStream();

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
      <h1>Generar Receta</h1>

      <textarea
        placeholder="Ej: pollo, arroz, cebolla"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

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
  <RecipeDisplay recipe={recipe} />
)}
      </div>
    </div>
  );
}
