import { useState, useEffect, useRef } from "react";
import { useDietaryRestrictions } from "../hooks/useDietaryRestrictions";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

export default function ProfilePage() {
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: restrictions, isLoading: isLoadingRestrictions } = useDietaryRestrictions();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  
  const [selectedRestrictionNames, setSelectedRestrictionNames] = useState<string[]>([]);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (profile?.dietaryRestrictions && !hasInitialized.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedRestrictionNames(profile.dietaryRestrictions.map((r) => r.name));
      hasInitialized.current = true;
    }
  }, [profile?.dietaryRestrictions]);

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
      preferredDifficulty: profile?.preferredDifficulty || "",
      maxCookingTime: profile?.maxCookingTime || "00:00:00",
      defaultServings: profile?.defaultServings || 1,
    });
  };

  if (isLoadingProfile || isLoadingRestrictions) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Mi Perfil</h1>
      
      {profile && (
        <div style={{ marginBottom: "20px" }}>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
        </div>
      )}

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
