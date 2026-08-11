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

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  boxShadow: "var(--shadow)",
  padding: "20px",
  marginBottom: "20px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 600,
  color: "var(--text-h)",
  marginBottom: "6px",
};

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "15px",
  backgroundColor: "var(--bg)",
  color: "var(--text-h)",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.2s",
};

const primaryButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  backgroundColor: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.2s, box-shadow 0.2s",
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

const errorStyle: React.CSSProperties = {
  color: "#e74c3c",
  fontSize: "14px",
  marginTop: "12px",
};

const fieldGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "12px",
};

export default function RecipeGeneratorPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [servings, setServings] = useState(1);
  const [maxCookingTimeMinutes, setMaxCookingTimeMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState("easy");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<"input" | "servings" | "time" | "difficulty" | null>(null);

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

  const fieldStyle = (field: "input" | "servings" | "time" | "difficulty"): React.CSSProperties => ({
    ...baseInputStyle,
    borderColor: focusedField === field ? "var(--accent-border)" : undefined,
  });

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
            backgroundColor: "var(--social-bg)",
            color: "var(--text)",
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
          backgroundColor: "var(--accent-bg)",
          color: "var(--accent)",
          border: isChallengeMode ? "1px solid var(--accent-border)" : "1px solid transparent",
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
      <button
        onClick={() => navigate(-1)}
        style={backButtonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
      >
        ← Volver
      </button>

      <h1>Generar Receta</h1>

      {challengeChip && <div style={{ marginBottom: "20px" }}>{challengeChip}</div>}

      <div style={cardStyle}>
        <h2 style={{ fontSize: "18px", margin: "0 0 12px" }}>Detectar ingredientes desde imagen</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isDetecting}
        />
        {isDetecting && <p style={{ color: "var(--accent)", marginTop: "8px" }}>Detectando ingredientes...</p>}
        {detectError && <p style={{ ...errorStyle }}>Error: {detectError}</p>}
        {imagePreview && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px", border: "1px solid var(--border)" }}
            />
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <label htmlFor="ingredients" style={labelStyle}>
          Ingredientes
        </label>
        <textarea
          id="ingredients"
          placeholder="Ej: pollo, arroz, cebolla"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocusedField("input")}
          onBlur={() => setFocusedField(null)}
          style={{ ...fieldStyle("input"), minHeight: "80px", resize: "vertical" }}
        />

        <RestrictionsChips />

        <div style={{ ...fieldGridStyle, marginTop: "16px" }}>
          <div>
            <label htmlFor="servings" style={labelStyle}>
              Porciones
            </label>
            <input
              id="servings"
              type="number"
              min={1}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              onFocus={() => setFocusedField("servings")}
              onBlur={() => setFocusedField(null)}
              style={fieldStyle("servings")}
            />
          </div>

          <div>
            <label htmlFor="time" style={labelStyle}>
              Tiempo máx (min)
            </label>
            <input
              id="time"
              type="number"
              min={1}
              value={maxCookingTimeMinutes}
              onChange={(e) => setMaxCookingTimeMinutes(Number(e.target.value))}
              onFocus={() => setFocusedField("time")}
              onBlur={() => setFocusedField(null)}
              style={fieldStyle("time")}
            />
          </div>

          <div>
            <label htmlFor="difficulty" style={labelStyle}>
              Dificultad
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              onFocus={() => setFocusedField("difficulty")}
              onBlur={() => setFocusedField(null)}
              style={fieldStyle("difficulty")}
            >
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isStreaming}
          style={{
            ...primaryButtonStyle,
            marginTop: "20px",
            opacity: isStreaming ? 0.6 : 1,
            cursor: isStreaming ? "not-allowed" : "pointer",
            boxShadow: isStreaming ? "none" : undefined,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {isStreaming ? "Generando..." : "Generar"}
        </button>

        {error && <p style={errorStyle}>{error}</p>}
      </div>

      <div style={{ marginTop: "20px" }}>
        {isStreaming && (
          <p style={{ color: "var(--accent)", fontWeight: 600 }}>Generando receta...</p>
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
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "8px 16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "var(--text-h)",
                    transition: "box-shadow 0.2s",
                  }}
                  title={match.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "var(--shadow)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
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
