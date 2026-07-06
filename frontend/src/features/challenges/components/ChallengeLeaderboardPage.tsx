import { useNavigate } from "react-router-dom";
import { useActiveChallenge } from "../hooks/useActiveChallenge";
import { useChallengeFeed, flattenFeedPages } from "../hooks/useChallengeFeed";
import { useVote } from "../hooks/useVote";
import useAuthStore from "../../../store/authStore";
import ChallengeFeed from "./ChallengeFeed";
import axios from "axios";

export default function ChallengeLeaderboardPage() {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.userId);
  const { data: challenge, isLoading: loadingChallenge, error } = useActiveChallenge();
  const feedQuery = useChallengeFeed(challenge?.id ?? null);
  const entries = flattenFeedPages(feedQuery.data);
  const totalCount = feedQuery.data?.pages?.[0]?.totalCount ?? 0;

  const notFound = axios.isAxiosError(error) && error.response?.status === 404;

  const challengeId = challenge?.id ?? 0;
  const { vote, unvote } = useVote(challengeId);

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
                entries={entries}
                currentUserId={userId}
                challengeOpen={challenge?.status === "Active"}
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
