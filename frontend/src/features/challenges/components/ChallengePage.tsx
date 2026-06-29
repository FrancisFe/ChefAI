import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import useChallengeStore from "../../../store/challengeStore";
import axios from "axios";

export default function ChallengePage() {
  const navigate = useNavigate();
  const { data: challenge, isLoading, error } = useActiveChallenge();
  const enterChallenge = useChallengeStore((s) => s.enterChallenge);

  const notFound = axios.isAxiosError(error) && error.response?.status === 404;

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>
        ← Volver
      </button>
      <h1>Modo Social</h1>

      {isLoading && <p>Cargando desafío...</p>}

      {notFound && (
        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            padding: "40px",
            border: "1px solid #eee",
            borderRadius: "12px",
          }}
        >
          <p style={{ fontSize: "48px", margin: 0 }}>🏆</p>
          <h2>No hay desafío activo esta semana</h2>
          <p style={{ color: "#666" }}>Vuelve pronto para ver el próximo desafío.</p>
        </div>
      )}

      {challenge && (
        <div
          style={{
            marginTop: "24px",
            padding: "24px",
            border: "2px solid #ffd700",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff9e6, #fff3cc)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "64px" }}>⭐</span>
            <h2 style={{ margin: "8px 0", color: "#b8860b" }}>
              {challenge.starIngredientName}
            </h2>
            <p style={{ color: "#666" }}>Ingrediente estrella de la semana</p>
          </div>

          <Countdown endDate={challenge.endDate} />

          <button
            disabled={challenge.hasParticipated}
            onClick={() => {
              enterChallenge(challenge.id, challenge.starIngredientName);
              navigate("/generate-recipe");
            }}
            style={{
              display: "block",
              margin: "24px auto 0",
              padding: "14px 32px",
              fontSize: "18px",
              fontWeight: 600,
              background: challenge.hasParticipated ? "#ccc" : "#ffd700",
              border: "none",
              borderRadius: "8px",
              cursor: challenge.hasParticipated ? "not-allowed" : "pointer",
              color: challenge.hasParticipated ? "#888" : "#333",
            }}
          >
            {challenge.hasParticipated ? "Ya participaste" : "Participar en el desafío"}
          </button>
        </div>
      )}
    </div>
  );
}

function Countdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const end = new Date(endDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("0d 0h 0m");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <div style={{ textAlign: "center", marginTop: "16px" }}>
      <p style={{ fontSize: "14px", color: "#888", marginBottom: "4px" }}>
        Cierre del desafío
      </p>
      <p style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>{timeLeft}</p>
    </div>
  );
}
