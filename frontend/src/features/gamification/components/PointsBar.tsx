import { usePoints } from "../hooks/useGamification";

export default function PointsBar() {
  const { data } = usePoints();

  if (!data) return null;

  const { totalPoints, currentStreak, currentLevel } = data;
  const showFireAnimation = currentStreak >= 5;

  return (
    <>
      <style>{`
        @keyframes fire-flicker {
          0%, 100% { transform: scaleY(1) translateY(0); opacity: 1; }
          25% { transform: scaleY(1.08) translateY(-1px); opacity: 0.9; }
          50% { transform: scaleY(0.95) translateY(0); opacity: 1; }
          75% { transform: scaleY(1.05) translateY(-0.5px); opacity: 0.95; }
        }
      `}</style>
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
    </>
  );
}
