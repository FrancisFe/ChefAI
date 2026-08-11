import { useNavigate } from "react-router-dom";
import type { ChallengeFeedEntry } from "../../../lib/api-client";

const rankColors: Record<number, string> = {
  1: "#ffd700",
  2: "#c0c0c0",
  3: "#cd7f32",
};

export default function ChallengeEntryCard({
  entry,
  rank,
  isOwnEntry,
  challengeOpen,
  onVote,
  onUnvote,
  isVoting,
}: {
  entry: ChallengeFeedEntry;
  rank: number;
  isOwnEntry: boolean;
  challengeOpen: boolean;
  onVote: () => void;
  onUnvote: () => void;
  isVoting: boolean;
}) {
  const navigate = useNavigate();
  const rankColor = rankColors[rank];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        border: `1px solid ${rankColor ?? "var(--border)"}`,
        borderRadius: "10px",
        background: rankColor ? `${rankColor}10` : "var(--bg)",
        boxShadow: rankColor ? `0 0 0 1px ${rankColor}30` : "none",
        transition: "transform 0.1s",
      }}
    >
      <span
        style={{
          fontSize: rank <= 3 ? "24px" : "18px",
          fontWeight: 700,
          color: rankColor ?? "var(--text)",
          minWidth: "32px",
          textAlign: "center",
        }}
      >
        {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <button
          type="button"
          onClick={() => navigate(`/recipe/${entry.recipeId}`)}
          style={{
            margin: 0,
            padding: 0,
            background: "none",
            border: "none",
            textAlign: "left",
            fontWeight: 600,
            fontSize: "16px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
            width: "100%",
            cursor: "pointer",
            color: "var(--accent)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.textDecoration = "none";
          }}
        >
          {entry.recipeTitle}
        </button>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text)" }}>
          👤 {entry.ownerName}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "18px",
            fontWeight: 700,
            minWidth: "28px",
            textAlign: "center",
            color: entry.hasVoted ? "var(--accent)" : "var(--text)",
          }}
        >
          {entry.voteCount}
        </span>
        {isOwnEntry ? (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: "var(--accent-bg)",
              color: "var(--accent)",
              whiteSpace: "nowrap",
            }}
          >
            Tu receta
          </span>
        ) : (
          <button
            onClick={entry.hasVoted ? onUnvote : onVote}
            disabled={isVoting || !challengeOpen}
            title={
              !challengeOpen
                ? "El desafío está cerrado"
                : entry.hasVoted
                ? "Quitar voto"
                : "Votar"
            }
            aria-label={
              !challengeOpen
                ? "El desafío está cerrado"
                : entry.hasVoted
                ? "Quitar voto"
                : "Votar por esta receta"
            }
            aria-pressed={entry.hasVoted}
            style={{
              background: "none",
              border: "none",
              cursor: isVoting || !challengeOpen ? "not-allowed" : "pointer",
              fontSize: "22px",
              padding: "4px 8px",
              borderRadius: "6px",
              color: entry.hasVoted ? "var(--accent)" : "var(--text)",
              opacity: isVoting || !challengeOpen ? 0.3 : 1,
              transition: "color 0.15s, transform 0.1s",
            }}
          >
            ▲
          </button>
        )}
      </div>
    </div>
  );
}
