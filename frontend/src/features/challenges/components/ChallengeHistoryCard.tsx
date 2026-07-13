import { useState } from "react";
import { useChallengeFeed, flattenFeedPages } from "../hooks/useChallengeFeed";
import ChallengeRankingTable from "./ChallengeRankingTable";
import type { ChallengeHistoryItem } from "../../../lib/api-client";

export default function ChallengeHistoryCard({ challenge }: { challenge: ChallengeHistoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const feedQuery = useChallengeFeed(expanded ? challenge.id : null);
  const entries = flattenFeedPages(feedQuery.data);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "10px",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "16px",
          border: "none",
          background: "var(--bg)",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--accent-bg)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--bg)";
        }}
      >
        <span style={{ fontSize: "28px" }}>⭐</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: "16px", color: "var(--text-h)" }}>
            {challenge.starIngredientName}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#888" }}>
            {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)} · {challenge.participationCount} participantes
          </p>
        </div>
        <span style={{ fontSize: "18px", color: "#888", transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>
          ▼
        </span>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
          {feedQuery.isLoading && (
            <p style={{ textAlign: "center", color: "#888", padding: "24px 0" }}>
              Cargando resultados...
            </p>
          )}
          {feedQuery.isError && (
            <p style={{ textAlign: "center", color: "#e53935", padding: "24px 0" }}>
              Error al cargar las recetas del desafío.
            </p>
          )}
          {feedQuery.data && (
            <>
              {entries.length > 0 ? (
                <div style={{ marginTop: "16px" }}>
                  <ChallengeRankingTable entries={entries} />
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "#888", padding: "24px 0" }}>
                  Este desafío no tuvo participaciones.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
