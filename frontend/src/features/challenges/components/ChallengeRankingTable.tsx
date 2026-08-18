import { useNavigate } from "react-router-dom";
import type { ChallengeFeedEntry } from "../../../lib/api-client";

const rankColors: Record<number, string> = {
  1: "#ffd700",
  2: "#c0c0c0",
  3: "#cd7f32",
};

export default function ChallengeRankingTable({
  entries,
}: {
  entries: ChallengeFeedEntry[];
}) {
  const navigate = useNavigate();

  if (entries.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "var(--text)", padding: "32px 0" }}>
        Aún no hay participaciones.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "14px",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "2px solid var(--border)",
              textAlign: "left",
            }}
          >
            <th scope="col" style={{ padding: "12px 8px", width: "60px", textAlign: "center" }}>#</th>
            <th scope="col" style={{ padding: "12px 8px" }}>Autor</th>
            <th scope="col" style={{ padding: "12px 8px" }}>Receta</th>
            <th scope="col" style={{ padding: "12px 8px", width: "80px", textAlign: "center" }}>Votos</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => {
            const rank = index + 1;
            const rankColor = rankColors[rank];
            return (
              <tr
                key={entry.entryId}
                style={{
                  borderBottom: "1px solid var(--border)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <td
                  style={{
                    padding: "12px 8px",
                    textAlign: "center",
                    fontSize: rank <= 3 ? "20px" : "15px",
                    fontWeight: 700,
                    color: rankColor ?? "var(--text)",
                  }}
                >
                  {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    color: "var(--text)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "150px",
                  }}
                >
                  {entry.ownerName}
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    color: "var(--text-h)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "250px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/recipe/${entry.recipeId}`)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "inherit",
                      fontWeight: "inherit",
                      fontSize: "inherit",
                      textAlign: "left",
                    }}
                  >
                    {entry.recipeTitle}
                  </button>
                </td>
                <td
                  style={{
                    padding: "12px 8px",
                    textAlign: "center",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: rankColor ?? "var(--text)",
                  }}
                >
                  {entry.voteCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
