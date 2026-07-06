import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useRecipeStream } from "../hooks/useRecipeStream";
import { useDetectIngredients } from "../hooks/useDetectIngredients";
import { useRecipeHistory } from "../hooks/useRecipeHistory";
import { useToggleFavorite } from "../hooks/useToggleFavorite";
import { useParticipate, type PointsResult } from "../../challenges/hooks/useParticipate";
import { useActiveChallenge } from "../../challenges/hooks/useActiveChallenge";
import { useProfile } from "../../auth/hooks/useProfile";
import useChallengeStore from "../../../store/challengeStore";
import RecipeDisplay from "./RecipeDisplay";
import RestrictionsChips from "./RestrictionsChips";
import ParticipationSuccessOverlay from "../../challenges/components/ParticipationSuccessOverlay";

export default function RecipeGeneratorPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [servings, setServings] = useState(1);
  const [maxCookingTimeMinutes, setMaxCookingTimeMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState("easy");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { recipe, recipeId, isStreaming, error, startStream } = useRecipeStream();
  const { detectFromImage, isDetecting, error: detectError } = useDetectIngredients();
  const { data: historyRecipes } = useRecipeHistory();
  const { addFavorite, removeFavorite } = useToggleFavorite();
  const participate = useParticipate();
  const { data: activeChallenge, isLoading: isChallengeLoading } = useActiveChallenge();
  const { isChallengeMode, activeChallengeId, starIngredientName, enterChallenge, exitChallenge } = useChallengeStore();
  const participatedRef = useRef(false);
  const profileDefaultsRef = useRef(false);
  const [participationResult, setParticipationResult] = useState<PointsResult | null>(null);
  const { data: profile } = useProfile();

  useEffect(() => {
    if (profile && !profileDefaultsRef.current) {
      profileDefaultsRef.current = true;
      setServings(profile.defaultServings);
      const timeParts = profile.maxCookingTime.split(":");
      if (timeParts.length === 3) {
        setMaxCookingTimeMinutes(parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]));
      }
      setDifficulty(profile.preferredDifficulty || "easy");
    }
  }, [profile]);

  useEffect(() => {
    if (isChallengeMode && activeChallenge?.hasParticipated) {
      exitChallenge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isStreaming && recipe && recipeId && isChallengeMode && activeChallengeId && !participatedRef.current) {
      participatedRef.current = true;
      participate.mutate(
        { challengeId: activeChallengeId, recipeId },
        { onSuccess: (data) => setParticipationResult(data) }
      );
    }
  }, [isStreaming, recipe, recipeId, isChallengeMode, activeChallengeId, participate]);

  const match = useMemo(() => {
    if (!recipe || !historyRecipes) return null;
    return historyRecipes.find((r) => r.title === recipe.title) ?? null;
  }, [recipe, historyRecipes]);

  useEffect(() => {
    if (!isStreaming && recipe) {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    }
  }, [isStreaming, recipe, queryClient]);

  const handleToggleChallenge = () => {
    if (isChallengeMode) {
      exitChallenge();
      if (input === starIngredientName) {
        setInput("");
      }
    } else if (activeChallenge) {
      enterChallenge(activeChallenge.id, activeChallenge.starIngredientName);
      setInput(activeChallenge.starIngredientName);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

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

  const challengeChip = (() => {
    if (isChallengeLoading || !activeChallenge) return null;

    const isDisabled = activeChallenge.hasParticipated;

    if (isDisabled) {
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: 500,
            backgroundColor: "#eee",
            color: "#888",
            cursor: "not-allowed",
            userSelect: "none",
          }}
        >
          <span>✓</span>
          <span>Ya participaste: {activeChallenge.starIngredientName}</span>
        </div>
      );
    }

    return (
      <div
        onClick={handleToggleChallenge}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "16px",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          userSelect: "none",
          backgroundColor: isChallengeMode ? "#fff9e6" : "#e3f2fd",
          color: isChallengeMode ? "#b8860b" : "#1976d2",
          border: isChallengeMode ? "1px solid #ffd700" : "1px solid transparent",
        }}
      >
        <span>⭐</span>
        <span>
          {isChallengeMode
            ? `Participando: ${starIngredientName} (click para salir)`
            : `Participar en desafío: ${activeChallenge.starIngredientName}`}
        </span>
      </div>
    );
  })();

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>← Volver</button>
      <h1>Generar Receta</h1>

      {challengeChip}

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

      {participationResult && (
        <ParticipationSuccessOverlay
          result={participationResult}
          onClose={() => {
            setParticipationResult(null);
            exitChallenge();
          }}
        />
      )}
    </div>
  );
}
