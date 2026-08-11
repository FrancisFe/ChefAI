import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { useChallengeFeed, flattenFeedPages } from "../hooks/useChallengeFeed";
import { useRankingHub } from "../../recipes/hooks/useRankingHub";
import ChallengeRankingTable from "./ChallengeRankingTable";
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
  marginTop: "16px",
  padding: "16px 20px",
  border: "1px solid var(--accent-border)",
  borderRadius: "10px",
  backgroundColor: "var(--accent-bg)",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "24px",
};

const outlineButtonStyle: React.CSSProperties = {
  marginTop: "24px",
  padding: "10px 24px",
  fontSize: "14px",
  fontWeight: 500,
  background: "transparent",
  border: "1px solid var(--accent-border)",
  borderRadius: "8px",
  cursor: "pointer",
  color: "var(--accent)",
};

const loadMoreButtonStyle: React.CSSProperties = {
  padding: "10px 24px",
  fontSize: "14px",
  fontWeight: 500,
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  cursor: "pointer",
  color: "var(--text)",
};

export default function ChallengeRankingPage() {
  const navigate = useNavigate();
  const { data: challenge, isLoading: loadingChallenge, error } = useActiveChallenge();
  const challengeId = challenge?.id ?? null;
  const feedQuery = useChallengeFeed(challengeId);
  const { ranking } = useRankingHub(challengeId);
  const entries = flattenFeedPages(feedQuery.data);
  const totalCount = feedQuery.data?.pages?.[0]?.totalCount ?? 0;

  const liveEntries = useMemo(() => {
    if (ranking.length === 0) return entries;

    const voteCounts = new Map(ranking.map((r) => [r.entryId, r.voteCount]));
    const rankOrder = new Map(ranking.map((r, i) => [r.entryId, i]));

    return entries
      .map((e) => ({
        ...e,
        voteCount: voteCounts.get(e.entryId) ?? e.voteCount,
      }))
      .sort((a, b) => {
        const aIdx = rankOrder.get(a.entryId);
        const bIdx = rankOrder.get(b.entryId);
        if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
        return b.voteCount - a.voteCount;
      });
  }, [entries, ranking]);

  const notFound = axios.isAxiosError(error) && error.response?.status === 404;

  return (
    <div>
      <h1>Ranking</h1>

      {loadingChallenge && <p style={{ color: "var(--text)" }}>Cargando desafío...</p>}

      {notFound && (
        <div style={mutedBoxStyle}>
          <p style={{ fontSize: "48px", margin: 0 }}>🏆</p>
          <h2>No hay desafío activo esta semana</h2>
          <p style={{ color: "var(--text)" }}>Vuelve pronto para ver el próximo desafío.</p>
        </div>
      )}

      {challenge && (
        <>
          <span role="status" aria-live="polite" className="sr-only">
            {ranking.length > 0 ? "Ranking actualizado en tiempo real" : ""}
          </span>
          <div style={heroCardStyle}>
            <span style={{ fontSize: "32px" }}>⭐</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: "var(--accent)" }}>
                {challenge.starIngredientName}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--text)" }}>
                {totalCount} participaciones
              </p>
            </div>
          </div>

          {feedQuery.isLoading ? (
            <p style={{ color: "var(--text)" }}>Cargando ranking...</p>
          ) : (
            <ChallengeRankingTable entries={liveEntries} />
          )}

          {feedQuery.hasNextPage && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => feedQuery.fetchNextPage()}
                disabled={feedQuery.isFetchingNextPage}
                style={{
                  ...loadMoreButtonStyle,
                  cursor: feedQuery.isFetchingNextPage ? "not-allowed" : "pointer",
                  opacity: feedQuery.isFetchingNextPage ? 0.5 : 1,
                }}
              >
                {feedQuery.isFetchingNextPage ? "Cargando..." : "Cargar más"}
              </button>
            </div>
          )}

          <button
            onClick={() => navigate("/challenge/leaderboard")}
            style={outlineButtonStyle}
          >
            Ver feed con votación
          </button>
        </>
      )}
    </div>
  );
}
