import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDietaryRestrictions } from "../hooks/useDietaryRestrictions";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

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

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: restrictions, isLoading: isLoadingRestrictions } = useDietaryRestrictions();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [selectedRestrictionNames, setSelectedRestrictionNames] = useState<string[]>([]);
  const [defaultServings, setDefaultServings] = useState(1);
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState(30);
  const [preferredDifficulty, setPreferredDifficulty] = useState("easy");
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

  if (isLoadingProfile || isLoadingRestrictions) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>← Volver</button>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>← Volver</button>
      <h1>Mi Perfil</h1>

      {profile && (
        <div style={{ marginBottom: "20px" }}>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <h2>Preferencias de Recetas</h2>

        <div style={{ marginBottom: "12px" }}>
          <label>
            <strong>Porciones por defecto:</strong>
            <input
              type="number"
              min={1}
              value={defaultServings}
              onChange={(e) => setDefaultServings(Number(e.target.value))}
              style={{ display: "block", marginTop: "4px", padding: "6px", width: "100px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>
            <strong>Tiempo de cocción máximo (minutos):</strong>
            <input
              type="number"
              min={1}
              value={cookingTimeMinutes}
              onChange={(e) => setCookingTimeMinutes(Number(e.target.value))}
              style={{ display: "block", marginTop: "4px", padding: "6px", width: "100px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>
            <strong>Dificultad preferida:</strong>
            <select
              value={preferredDifficulty}
              onChange={(e) => setPreferredDifficulty(e.target.value)}
              style={{ display: "block", marginTop: "4px", padding: "6px" }}
            >
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Restricciones Dietéticas</h2>
        {restrictions && restrictions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {restrictions.map((restriction) => (
              <label
                key={restriction.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedRestrictionNames.includes(restriction.name)}
                  onChange={(e) =>
                    handleRestrictionChange(restriction.name, e.target.checked)
                  }
                />
                <span>{restriction.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p>No hay restricciones dietéticas disponibles</p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={isUpdating}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isUpdating ? "not-allowed" : "pointer",
          opacity: isUpdating ? 0.5 : 1,
        }}
      >
        {isUpdating ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
}
