import { useState } from "react";
import { useRecipeStream } from "../hooks/useRecipeStream";
import { useDetectIngredients } from "../hooks/useDetectIngredients";
import RecipeDisplay from "./RecipeDisplay";

export default function RecipeGeneratorPage() {
  const [input, setInput] = useState("");
  const [servings, setServings] = useState(1);
  const [maxCookingTimeMinutes, setMaxCookingTimeMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState("easy");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { recipe, isStreaming, error, startStream } = useRecipeStream();
  const { detectFromImage, isDetecting, error: detectError } = useDetectIngredients();

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
