import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface PointsResult {
  pointsEarned: number;
  totalPoints: number;
  currentLevel: number;
}

export default function ParticipationSuccessOverlay({
  result,
  onClose,
}: {
  result: PointsResult;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryButtonRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="participation-success-title"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          borderRadius: "16px",
          padding: "40px",
          maxWidth: "420px",
          width: "90%",
          textAlign: "center",
          boxShadow: "var(--shadow)",
          animation: "fadeIn 0.3s ease",
        }}
      >
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>

        <h2 id="participation-success-title" style={{ margin: "0 0 8px", color: "var(--text-h)", fontSize: "22px" }}>
          ¡Tu receta fue enviada al desafío!
        </h2>

        <p style={{ color: "var(--text)", margin: "8px 0 24px", fontSize: "15px" }}>
          ¡Buena suerte! Mirá cómo van los demás participantes.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "var(--accent-bg)",
            }}
          >
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "var(--accent)" }}>
              +{result.pointsEarned}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text)" }}>puntos</p>
          </div>
          <div
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "var(--accent-bg)",
            }}
          >
            <p style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "var(--accent)" }}>
              {result.currentLevel}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text)" }}>nivel</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            ref={primaryButtonRef}
            onClick={() => {
              onClose();
              navigate("/challenge/leaderboard");
            }}
            style={{
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: 600,
              background: "var(--accent)",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            Ver participaciones
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 500,
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              cursor: "pointer",
              color: "var(--text)",
            }}
          >
            Seguir cocinando
          </button>
        </div>
      </div>
    </div>
  );
}
