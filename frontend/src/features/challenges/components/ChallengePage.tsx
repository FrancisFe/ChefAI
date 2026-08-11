import { useNavigate } from "react-router-dom";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { useCountdown } from "../hooks/useCountdown";
import useChallengeStore from "../../../store/challengeStore";
import axios from "axios";

const mutedBoxStyle: React.CSSProperties = {
  marginTop: "40px",
  textAlign: "center",
  padding: "40px",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  backgroundColor: "var(--bg)",
};

const heroCardStyle: React.CSSProperties = {
  marginTop: "24px",
  padding: "24px",
  border: "1px solid var(--accent-border)",
  borderRadius: "12px",
  backgroundColor: "var(--accent-bg)",
};

const primaryButtonStyle: React.CSSProperties = {
  display: "block",
  margin: "24px auto 0",
  padding: "14px 32px",
  fontSize: "18px",
  fontWeight: 600,
  backgroundColor: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "opacity 0.2s, box-shadow 0.2s",
};

const outlineButtonStyle: React.CSSProperties = {
  display: "block",
  margin: "12px auto 0",
  padding: "10px 24px",
  fontSize: "15px",
  fontWeight: 500,
  background: "transparent",
  border: "1px solid var(--accent-border)",
  borderRadius: "8px",
  cursor: "pointer",
  color: "var(--accent)",
};

export default function ChallengePage() {
  const navigate = useNavigate();
  const { data: challenge, isLoading, error } = useActiveChallenge();
  const enterChallenge = useChallengeStore((s) => s.enterChallenge);

  const notFound = axios.isAxiosError(error) && error.response?.status === 404;

  return (
    <div>
      <h1>Desafío Activo</h1>

      {isLoading && <p style={{ color: "var(--text)" }}>Cargando desafío...</p>}

      {notFound && (
        <div style={mutedBoxStyle}>
          <p style={{ fontSize: "48px", margin: 0 }}>🏆</p>
          <h2>No hay desafío activo esta semana</h2>
          <p style={{ color: "var(--text)" }}>Vuelve pronto para ver el próximo desafío.</p>
        </div>
      )}

      {challenge && (
        <div style={heroCardStyle}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "64px" }}>⭐</span>
            <h2 style={{ margin: "8px 0", color: "var(--accent)" }}>
              {challenge.starIngredientName}
            </h2>
            <p style={{ color: "var(--text)" }}>Ingrediente estrella de la semana</p>
          </div>

          <CountdownDisplay endDate={challenge.endDate} />

          <button
            disabled={challenge.hasParticipated}
            onClick={() => {
              enterChallenge(challenge.id, challenge.starIngredientName);
              navigate("/generate-recipe");
            }}
            style={{
              ...primaryButtonStyle,
              backgroundColor: challenge.hasParticipated ? "var(--social-bg)" : "var(--accent)",
              color: challenge.hasParticipated ? "var(--text)" : "#fff",
              cursor: challenge.hasParticipated ? "not-allowed" : "pointer",
            }}
          >
            {challenge.hasParticipated ? "Ya participaste" : "Participar en el desafío"}
          </button>

          <button
            onClick={() => navigate("/challenge/leaderboard")}
            style={outlineButtonStyle}
          >
            Ver feed
          </button>

          <button
            onClick={() => navigate("/challenge/ranking")}
            style={outlineButtonStyle}
          >
            Ver ranking
          </button>
        </div>
      )}
    </div>
  );
}

function CountdownDisplay({ endDate }: { endDate: string }) {
  const timeLeft = useCountdown(endDate);

  return (
    <div style={{ textAlign: "center", marginTop: "16px" }}>
      <p style={{ fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>
        Cierre del desafío
      </p>
      <p style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: "var(--text-h)" }}>{timeLeft}</p>
    </div>
  );
}
