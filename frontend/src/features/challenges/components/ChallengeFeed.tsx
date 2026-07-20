import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChallengeFeedEntry } from "../../../lib/api-client";
import type { ConnectionStatus } from "../../recipes/hooks/useRankingHub";
import ChallengeEntryCard from "./ChallengeEntryCard";
import ConnectionIndicator from "./ConnectionIndicator";

export default function ChallengeFeed({
  entries,
  currentUserId,
  challengeOpen,
  connectionStatus,
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
  connectionStatus?: ConnectionStatus;
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Buscar por receta o autor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
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
        {connectionStatus && <ConnectionIndicator status={connectionStatus} />}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", padding: "32px 0" }}>
          {entries.length === 0
            ? "Aún no hay participaciones. ¡Sé el primero!"
            : "No se encontraron resultados."}
        </p>
      )}

      <motion.div
        layout
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((entry) => (
            <motion.div
              key={entry.entryId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              <ChallengeEntryCard
                entry={entry}
                rank={entries.indexOf(entry) + 1}
                isOwnEntry={currentUserId !== null && entry.ownerUserId === Number(currentUserId)}
                challengeOpen={challengeOpen}
                onVote={() => onVote(entry.entryId)}
                onUnvote={() => onUnvote(entry.entryId)}
                isVoting={isVoting}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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
