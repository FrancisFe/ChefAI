import { useState } from "react";
import { useBadges } from "../hooks/useGamification";

export default function BadgeGrid() {
  const { data: badges, isLoading } = useBadges();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  if (isLoading) return <p style={{ color: "var(--text)" }}>Cargando badges...</p>;
  if (!badges || badges.length === 0)
    return <p style={{ color: "var(--text)" }}>No hay badges disponibles.</p>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: "12px",
      }}
    >
      {badges.map((badge) => {
        const isLocked = !badge.isUnlocked;
        return (
          <div
            key={badge.id}
            tabIndex={isLocked ? 0 : undefined}
            role={isLocked ? "button" : undefined}
            aria-label={isLocked ? `Bloqueado: ${badge.name}` : undefined}
            aria-describedby={isLocked && hoveredId === badge.id ? `badge-tip-${badge.id}` : undefined}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "16px 8px",
              borderRadius: "8px",
              border: `1px solid ${isLocked ? "var(--border)" : "var(--accent-border)"}`,
              background: isLocked
                ? "var(--code-bg)"
                : "var(--accent-bg)",
              opacity: isLocked ? 0.55 : 1,
              filter: isLocked ? "grayscale(0.8)" : "none",
              cursor: "default",
              transition: "opacity 0.2s, filter 0.2s",
            }}
            onMouseEnter={() => isLocked && setHoveredId(badge.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => isLocked && setHoveredId(badge.id)}
            onBlur={() => setHoveredId(null)}
          >
            {isLocked && (
              <span style={{ fontSize: "24px", position: "absolute", top: "4px", right: "6px" }}>
                🔒
              </span>
            )}
            <span style={{ fontSize: "32px" }}>🏅</span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                textAlign: "center",
                color: isLocked ? "var(--text)" : "var(--text-h)",
              }}
            >
              {badge.name}
            </span>
            {isLocked && hoveredId === badge.id && (
              <div
                id={`badge-tip-${badge.id}`}
                role="tooltip"
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: "var(--text-h)",
                  whiteSpace: "nowrap",
                  boxShadow: "var(--shadow)",
                  zIndex: 10,
                  pointerEvents: "none",
                }}
              >
                {badge.description ?? "Condición desconocida"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
