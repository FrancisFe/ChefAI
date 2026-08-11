import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDietaryRestrictions } from "../hooks/useDietaryRestrictions";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import BadgeGrid from "../../gamification/components/BadgeGrid";

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

const fieldGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "12px",
};

function timeSpanToMinutes(ts: string): number {
  const parts = ts.split(":");
  if (parts.length === 3) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 30;
}

function minutesToTimeSpan(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`;
}

type FieldName = "servings" | "time" | "difficulty";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: restrictions, isLoading: isLoadingRestrictions } = useDietaryRestrictions();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [selectedRestrictionNames, setSelectedRestrictionNames] = useState<string[]>([]);
  const [defaultServings, setDefaultServings] = useState(1);
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState(30);
  const [preferredDifficulty, setPreferredDifficulty] = useState("easy");
  const [focusedField, setFocusedField] = useState<FieldName | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (profile && !hasInitialized.current) {
      hasInitialized.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRestrictionNames(profile.dietaryRestrictions.map((r) => r.name));
      setDefaultServings(profile.defaultServings);
      setCookingTimeMinutes(timeSpanToMinutes(profile.maxCookingTime));
      setPreferredDifficulty(profile.preferredDifficulty || "easy");
    }
  }, [profile]);

  const handleRestrictionChange = (name: string, checked: boolean) => {
    setSelectedRestrictionNames((prev) =>
      checked ? Array.from(new Set([...prev, name])) : prev.filter((item) => item !== name)
    );
  };

  const handleSave = () => {
    const selectedRestrictions = restrictions?.filter((restriction) =>
      selectedRestrictionNames.includes(restriction.name)
    ) ?? [];

    updateProfile({
      dietaryRestrictions: selectedRestrictions,
      preferredDifficulty,
      maxCookingTime: minutesToTimeSpan(cookingTimeMinutes),
      defaultServings,
    });
  };

  const fieldStyle = (field: FieldName): React.CSSProperties => ({
    ...baseInputStyle,
    borderColor: focusedField === field ? "var(--accent-border)" : undefined,
  });

  if (isLoadingProfile || isLoadingRestrictions) {
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
        <div style={cardStyle}>
          <p style={{ color: "var(--text)" }}>Cargando...</p>
        </div>
      </div>
    );
  }

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

      <h1>Mi Perfil</h1>

      {profile && (
        <div style={cardStyle}>
          <label style={labelStyle}>Email</label>
          <p style={{ color: "var(--text-h)" }}>{profile.email}</p>
        </div>
      )}

      <div style={cardStyle}>
        <h2 style={{ fontSize: "18px", margin: "0 0 16px" }}>Preferencias de Recetas</h2>

        <div style={fieldGridStyle}>
          <div>
            <label htmlFor="servings" style={labelStyle}>
              Porciones por defecto
            </label>
            <input
              id="servings"
              type="number"
              min={1}
              value={defaultServings}
              onChange={(e) => setDefaultServings(Number(e.target.value))}
              onFocus={() => setFocusedField("servings")}
              onBlur={() => setFocusedField(null)}
              style={fieldStyle("servings")}
            />
          </div>

          <div>
            <label htmlFor="time" style={labelStyle}>
              Tiempo de cocción máx (min)
            </label>
            <input
              id="time"
              type="number"
              min={1}
              value={cookingTimeMinutes}
              onChange={(e) => setCookingTimeMinutes(Number(e.target.value))}
              onFocus={() => setFocusedField("time")}
              onBlur={() => setFocusedField(null)}
              style={fieldStyle("time")}
            />
          </div>

          <div>
            <label htmlFor="difficulty" style={labelStyle}>
              Dificultad preferida
            </label>
            <select
              id="difficulty"
              value={preferredDifficulty}
              onChange={(e) => setPreferredDifficulty(e.target.value)}
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
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: "18px", margin: "0 0 16px" }}>Restricciones Dietéticas</h2>
        {restrictions && restrictions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {restrictions.map((restriction) => {
              const isSelected = selectedRestrictionNames.includes(restriction.name);
              return (
                <label
                  key={restriction.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    border: `1px solid ${isSelected ? "var(--accent-border)" : "var(--border)"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: isSelected ? "var(--accent-bg)" : "var(--bg)",
                    transition: "border-color 0.2s, background-color 0.2s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      handleRestrictionChange(restriction.name, e.target.checked)
                    }
                  />
                  <span style={{ color: "var(--text-h)" }}>{restriction.name}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--text)" }}>No hay restricciones dietéticas disponibles</p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={isUpdating}
        style={{
          ...primaryButtonStyle,
          opacity: isUpdating ? 0.6 : 1,
          cursor: isUpdating ? "not-allowed" : "pointer",
          boxShadow: isUpdating ? "none" : undefined,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "var(--shadow)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {isUpdating ? "Guardando..." : "Guardar"}
      </button>

      <div style={{ marginTop: "32px" }}>
        <h2>Mis Badges</h2>
        <BadgeGrid />
      </div>
    </div>
  );
}
