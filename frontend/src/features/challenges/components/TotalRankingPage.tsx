import { useQuery } from "@tanstack/react-query";
import { getTotalPointsRanking, type TotalPointsRankingItem } from "../../../lib/api-client";
import useAuthStore from "../../../store/authStore";

const rankColors: Record<number, string> = {
  1: "#ffd700",
  2: "#c0c0c0",
  3: "#cd7f32",
};

export default function TotalRankingPage() {
  const userId = useAuthStore((s) => s.userId);

  const { data: ranking, isLoading } = useQuery<TotalPointsRankingItem[]>({
    queryKey: ["challenge", "ranking", "total"],
    queryFn: getTotalPointsRanking,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div>
      <h1>Ranking Global</h1>
      <p style={{ color: "var(--text)", marginBottom: "24px" }}>
        Puntos totales acumulados por votos recibidos en todos los desafíos.
      </p>

      {isLoading && <p>Cargando ranking...</p>}

      {ranking && ranking.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", border: "1px solid var(--border)", borderRadius: "12px" }}>
          <p style={{ fontSize: "48px", margin: 0 }}>🏆</p>
          <h2>Todavía no hay puntos</h2>
          <p style={{ color: "var(--text)" }}>Participá en desafíos para aparecer en el ranking.</p>
        </div>
      )}

      {ranking && ranking.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                <th scope="col" style={{ padding: "12px 8px", width: "60px", textAlign: "center" }}>#</th>
                <th scope="col" style={{ padding: "12px 8px" }}>Usuario</th>
                <th scope="col" style={{ padding: "12px 8px", width: "100px", textAlign: "center" }}>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item) => {
                const rankColor = rankColors[item.rank];
                return (
                  <tr
                    key={item.userId}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: item.userId === userId ? "var(--accent-bg)" : "transparent",
                      fontWeight: item.userId === userId ? 700 : 400,
                    }}
                  >
                    <td style={{ padding: "12px 8px", textAlign: "center", fontSize: item.rank <= 3 ? "20px" : "15px", fontWeight: 700, color: rankColor ?? "var(--text)" }}>
                      {item.rank <= 3 ? ["🥇", "🥈", "🥉"][item.rank - 1] : `#${item.rank}`}
                    </td>
                    <td style={{ padding: "12px 8px", color: "var(--text)" }}>
                      {item.userName}
                      {item.userId === userId && " (tú)"}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontSize: "16px", fontWeight: 700 }}>
                      {item.totalVotes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
