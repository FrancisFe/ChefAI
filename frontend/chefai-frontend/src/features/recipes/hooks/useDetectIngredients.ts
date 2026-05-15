import { useState } from "react";
import { detectIngredientsFromImage } from "../../../lib/api-client";

export const useDetectIngredients = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectFromImage = async (file: File): Promise<string[]> => {
    setIsDetecting(true);
    setError(null);

    try {
      const result = await detectIngredientsFromImage(file);
      return result.ingredients;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al detectar ingredientes";
      setError(message);
      return [];
    } finally {
      setIsDetecting(false);
    }
  };

  return { detectFromImage, isDetecting, error };
};
