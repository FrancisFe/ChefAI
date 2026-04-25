import { useState } from "react";
import useAuthStore from "../../../store/authStore";

export interface GeneratedRecipe {
  title: string;
  description: string;
  cookingTimeMinutes: number;
  servings: number;
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: string[];
}
export interface GenerateRecipeRequest {
  ingredients: string[];
  userId: number;
  servings: number;
  maxCookingTimeMinutes: number;
  difficulty: string;
}

export interface RecipeStreamParams {
  ingredients: string[];
  servings: number;
  maxCookingTimeMinutes: number;
  difficulty: string;
}

function parseRecipeFromText(text: string): GeneratedRecipe | null {
  try {
    // Limpiar caracteres de escape literal \n
    text = text.replace(/\\n/g, "\n");
    
    // Limpiar prefijos comunes del stream
    text = text.replace(/\[DONE\]/g, "").trim();
    
    const lines = text.split(/\r\n|\r|\n/);
    const recipe: GeneratedRecipe = {
      title: "",
      description: "",
      cookingTimeMinutes: 30,
      servings: 4,
      ingredients: [],
      steps: [],
    };

    let currentSection = 0; // 0=start, 1=description, 2=ingredients, 3=steps
    const ingredientLines: string[] = [];
    const stepLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Detect title
      if (line.startsWith("# ") && currentSection === 0) {
        recipe.title = line.substring(2).trim();
        currentSection = 1;
        continue;
      }

      // Detect ingredients section
      if (line.startsWith("## ") && line.includes("Ingrediente")) {
        currentSection = 2;
        continue;
      }

      // Detect steps section
      if (line.startsWith("## ") && line.includes("Paso")) {
        currentSection = 3;
        continue;
      }

      // Extract meta info (time and servings)
      if (line.includes("Tiempo:")) {
        const timeMatch = line.match(/Tiempo:\s*(\d+)/i);
        if (timeMatch) recipe.cookingTimeMinutes = parseInt(timeMatch[1]);

        const servingsMatch = line.match(/Porciones:\s*(\d+)/i);
        if (servingsMatch) recipe.servings = parseInt(servingsMatch[1]);
      }

      // Process ingredients
      if (currentSection === 2 && (line.startsWith("- ") || line.startsWith("* "))) {
        ingredientLines.push(line.substring(2).trim());
      }

      // Process steps
      if (currentSection === 3) {
        // Skip section headers or separators
        if (
          line.startsWith("##") ||
          line.startsWith("#") ||
          line.startsWith("---")
        ) {
          // Skip this line
        } else {
          let stepText = line;

          if (line.startsWith("- ") || line.startsWith("* ")) {
            stepText = line.substring(2).trim();
          } else if (line && /^\d+\./.test(line)) {
            // Remove "1.", "2.", etc.
            const dotIndex = line.indexOf(".");
            if (dotIndex > 0 && dotIndex < 3) {
              stepText = line.substring(dotIndex + 1).trim();
            }
          }
          // Otherwise, assume it's a continuation line of a step

          if (stepText) stepLines.push(stepText);
        }
      }

      // Description (after title, before meta info)
      if (
        currentSection === 1 &&
        !line.startsWith("#") &&
        !line.includes("Tiempo:")
      ) {
        if (!recipe.description) {
          recipe.description = line;
        }
      }
    }

    // Parse ingredients
    recipe.ingredients = parseIngredients(ingredientLines);
    recipe.steps = stepLines;

    return recipe;
  } catch (error) {
    console.error("Error parsing recipe:", error);
    return null;
  }
}

function parseIngredients(
  ingredientLines: string[]
): { name: string; quantity: string; unit: string }[] {
  const ingredients: { name: string; quantity: string; unit: string }[] = [];

  for (let line of ingredientLines) {
    if (!line) continue;

    // Normalize em-dashes to regular hyphens
    line = line.replace(/—/g, " - ").replace(/–/g, " - ");

    // Expected format: "cantidad unidad - nombre" or "a gusto - nombre"
    const parts = line.split(" - ");

    if (parts.length >= 2) {
      let name = parts[parts.length - 1].trim();
      const quantityUnit = parts.slice(0, parts.length - 1).join(" - ").trim();

      // Clean extra spaces
      name = name.replace(/\s+/g, " ");

      const ingredient = parseQuantityAndUnit(quantityUnit, name);
      if (ingredient.name) ingredients.push(ingredient);
    } else if (parts.length === 1) {
      // If no " - ", assume it's just name without quantity
      let name = parts[0].trim();
      name = name.replace(/\s+/g, " ");
      if (name) {
        ingredients.push({ name, quantity: "", unit: "" });
      }
    }
  }

  return ingredients;
}

function parseQuantityAndUnit(
  quantityUnit: string,
  name: string
): { name: string; quantity: string; unit: string } {
  const ingredient = { name, quantity: "", unit: "" };

  if (!quantityUnit) return ingredient;

  quantityUnit = quantityUnit.trim();
  name = name.trim();

  // If both start with "a gusto", clean up duplicated "a gusto" from name
  if (
    quantityUnit.toLowerCase().startsWith("a gusto") &&
    name.toLowerCase().startsWith("a gusto")
  ) {
    if (name.toLowerCase().startsWith("a gusto - "))
      name = name.substring("a gusto - ".length).trim();
    else if (name.toLowerCase().startsWith("a gusto-"))
      name = name.substring("a gusto-".length).trim();
    else if (name.toLowerCase().startsWith("a gusto"))
      name = name.substring("a gusto".length).trim();

    ingredient.name = name;
    ingredient.quantity = "a gusto";
    ingredient.unit = "";
    return ingredient;
  }

  // If it's "a gusto" or similar
  if (
    quantityUnit.toLowerCase().includes("a gusto") ||
    quantityUnit.toLowerCase().includes("al gusto")
  ) {
    ingredient.quantity = "a gusto";
    ingredient.unit = "";
    return ingredient;
  }

  const tokens = quantityUnit.split(/\s+/).filter((t) => t);

  if (tokens.length === 0) return ingredient;

  // First token tries to be quantity
  if (!isNaN(parseFloat(tokens[0]))) {
    ingredient.quantity = tokens[0];
    if (tokens.length > 1) {
      ingredient.unit = tokens.slice(1).join(" ");
    }
  } else {
    // Everything is unit or description
    ingredient.unit = quantityUnit;
  }

  return ingredient;
}

export function useRecipeStream() {
  const [text, setText] = useState("");
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.userId);

  const startStream = async (params: RecipeStreamParams) => {
    if (!userId) {
      setError("Usuario no autenticado");
      return;
    }

    setText("");
    setRecipe(null);
    setIsStreaming(true);
    setError(null);

    let accumulated = "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/recipe/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...params, userId }),
        }
      );

      if (!response.ok) throw new Error("Error en la respuesta");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("No reader");

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });

        for (let line of chunk.split("\n")) {
          line = line.trim();
          if (!line || !line.startsWith("data:")) continue;

          const data = line.replace("data:", "").trim();

          if (data === "[DONE]") {
            try {
              const parsedRecipe = parseRecipeFromText(accumulated);
              if (parsedRecipe) {
                setRecipe(parsedRecipe);
              } else {
                setError("Error al parsear la receta");
              }
            } catch {
              setError("Error al procesar la receta");
            }
            setIsStreaming(false);
            return;
          }

          accumulated += data;
          setText(accumulated);
        }
      }
    } catch {
      setError("Error en el stream");
    } finally {
      setIsStreaming(false);
    }
  };

  return { text, recipe, isStreaming, error, startStream };
}