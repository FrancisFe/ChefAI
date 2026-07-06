import { useState, useMemo } from "react";
import type { ChallengeFeedEntry } from "../../../lib/api-client";
import ChallengeEntryCard from "./ChallengeEntryCard";

export default function ChallengeFeed({
  entries,
  currentUserId,
  challengeOpen,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onVote,
  onUnvote,
  isVoting,
}: {
  entries: ChallengeFeedEntry[];
  currentUserId: number | null;
  challengeOpen: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onVote: (entryId: number) => void;
  onUnvote: (entryId: number) => void;
  isVoting: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.recipeTitle.toLowerCase().includes(q) ||
        e.ownerName.toLowerCase().includes(q)
    );
  }, [entries, search]);

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Buscar por receta o autor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            fontSize: "14px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            background: "var(--bg)",
            color: "var(--text)",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", padding: "32px 0" }}>
          {entries.length === 0
            ? "Aún no hay participaciones. ¡Sé el primero!"
            : "No se encontraron resultados."}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((entry) => (
          <ChallengeEntryCard
            key={entry.entryId}
            entry={entry}
            rank={entries.indexOf(entry) + 1}
            isOwnEntry={currentUserId !== null && entry.ownerUserId === Number(currentUserId)}
            challengeOpen={challengeOpen}
            onVote={() => onVote(entry.entryId)}
            onUnvote={() => onUnvote(entry.entryId)}
            isVoting={isVoting}
          />
        ))}
      </div>

      {hasNextPage && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            style={{
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 500,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: isFetchingNextPage ? "not-allowed" : "pointer",
              color: "var(--text)",
              opacity: isFetchingNextPage ? 0.5 : 1,
            }}
          >
            {isFetchingNextPage ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      )}
    </div>
  );
}
