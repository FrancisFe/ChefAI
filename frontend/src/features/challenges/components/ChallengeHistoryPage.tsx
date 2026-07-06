import { useChallengeHistory } from "../hooks/useChallengeHistory";
import ChallengeHistoryCard from "./ChallengeHistoryCard";

export default function ChallengeHistoryPage() {
  const { data: challenges, isLoading } = useChallengeHistory();

  return (
    <div>
      <h1>Historial de desafíos</h1>

      {isLoading && <p>Cargando historial...</p>}

      {!isLoading && challenges && challenges.length === 0 && (
        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            padding: "40px",
            border: "1px solid var(--border)",
            borderRadius: "12px",
          }}
        >
          <p style={{ fontSize: "48px", margin: 0 }}>📜</p>
          <h2>No hay desafíos anteriores</h2>
          <p style={{ color: "#666" }}>
            Los desafíos completados aparecerán aquí con su ranking final.
          </p>
        </div>
      )}

      {!isLoading && challenges && challenges.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
          {challenges.map((challenge) => (
            <ChallengeHistoryCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}
