import { usePoints } from "../hooks/useGamification";

export default function PointsBar() {
  const { data } = usePoints();

  if (!data) return null;

  const { totalPoints, currentStreak, currentLevel } = data;
  const showFireAnimation = currentStreak >= 5;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "8px 16px",
        background: "var(--accent-bg)",
        borderBottom: "1px solid var(--border)",
        fontSize: "14px",
      }}
    >
      <span style={{ fontWeight: 600, color: "var(--text-h)" }}>
        Nivel {currentLevel}
      </span>
      <span style={{ color: "var(--text)" }}>
        {totalPoints} pts
      </span>
      {currentStreak >= 5 && (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              display: "inline-block",
              animation: showFireAnimation ? "fire-flicker 0.6s ease-in-out infinite" : "none",
              fontSize: "18px",
            }}
          >
            🔥
          </span>
          <span style={{ color: "var(--text-h)", fontWeight: 600 }}>{currentStreak}</span>
          <span style={{ color: "var(--text)" }}>días</span>
        </div>
      )}
    </div>
  );
}
