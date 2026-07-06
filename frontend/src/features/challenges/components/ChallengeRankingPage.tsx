import { useNavigate } from "react-router-dom";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { useChallengeFeed, flattenFeedPages } from "../hooks/useChallengeFeed";
import ChallengeRankingTable from "./ChallengeRankingTable";
import axios from "axios";

export default function ChallengeRankingPage() {
  const navigate = useNavigate();
  const { data: challenge, isLoading: loadingChallenge, error } = useActiveChallenge();
  const feedQuery = useChallengeFeed(challenge?.id ?? null);
  const entries = flattenFeedPages(feedQuery.data);
  const totalCount = feedQuery.data?.pages?.[0]?.totalCount ?? 0;

  const notFound = axios.isAxiosError(error) && error.response?.status === 404;

  return (
    <div>
      <h1>Ranking</h1>

      {loadingChallenge && <p>Cargando desafío...</p>}

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
        <>
          <div
            style={{
              marginTop: "16px",
              padding: "16px 20px",
              border: "2px solid #ffd700",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #fff9e6, #fff3cc)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <span style={{ fontSize: "32px" }}>⭐</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "#b8860b" }}>
                {challenge.starIngredientName}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#888" }}>
                {totalCount} participaciones
              </p>
            </div>
          </div>

          {feedQuery.isLoading ? (
            <p>Cargando ranking...</p>
          ) : (
            <ChallengeRankingTable entries={entries} />
          )}

          {feedQuery.hasNextPage && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => feedQuery.fetchNextPage()}
                disabled={feedQuery.isFetchingNextPage}
                style={{
                  padding: "10px 24px",
                  fontSize: "14px",
                  fontWeight: 500,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  cursor: feedQuery.isFetchingNextPage ? "not-allowed" : "pointer",
                  color: "var(--text)",
                  opacity: feedQuery.isFetchingNextPage ? 0.5 : 1,
                }}
              >
                {feedQuery.isFetchingNextPage ? "Cargando..." : "Cargar más"}
              </button>
            </div>
          )}

          <button
            onClick={() => navigate("/challenge/leaderboard")}
            style={{
              marginTop: "24px",
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 500,
              background: "transparent",
              border: "1px solid var(--accent)",
              borderRadius: "8px",
              cursor: "pointer",
              color: "var(--accent)",
            }}
          >
            Ver feed con votación
          </button>
        </>
      )}
    </div>
  );
}
