import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { useChallengeFeed, flattenFeedPages } from "../hooks/useChallengeFeed";
import { useVote } from "../hooks/useVote";
import { useRankingHub } from "../../recipes/hooks/useRankingHub";
import useAuthStore from "../../../store/authStore";
import ChallengeFeed from "./ChallengeFeed";
import axios from "axios";

export default function ChallengeLeaderboardPage() {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.userId);
  const { data: challenge, isLoading: loadingChallenge, error } = useActiveChallenge();
  const challengeId = challenge?.id ?? null;
  const feedQuery = useChallengeFeed(challengeId);
  const { ranking, connectionState: rankingConnectionState } = useRankingHub(challengeId);
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

  const { vote, unvote } = useVote(challenge?.id ?? 0);

  const handleVote = (entryId: number) => vote.mutate(entryId);
  const handleUnvote = (entryId: number) => unvote.mutate(entryId);

  return (
    <div>
      <h1>Feed</h1>

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

          <div style={{ marginTop: "24px" }}>
            {feedQuery.isLoading ? (
              <p>Cargando participaciones...</p>
            ) : (
              <ChallengeFeed
                entries={liveEntries}
                currentUserId={userId}
                challengeOpen={challenge?.status === "Active"}
                connectionStatus={rankingConnectionState}
                hasNextPage={!!feedQuery.hasNextPage}
                isFetchingNextPage={feedQuery.isFetchingNextPage}
                onLoadMore={() => feedQuery.fetchNextPage()}
                onVote={handleVote}
                onUnvote={handleUnvote}
                isVoting={vote.isPending || unvote.isPending}
              />
            )}
          </div>

          <button
            onClick={() => navigate("/challenge/ranking")}
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
            Ver ranking
          </button>
        </>
      )}
    </div>
  );
}
