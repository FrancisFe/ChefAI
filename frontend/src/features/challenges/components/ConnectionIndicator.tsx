import type { ConnectionStatus } from "../../recipes/hooks/useRankingHub";

const dot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  display: "inline-block",
  flexShrink: 0,
};

const styles: Record<ConnectionStatus, React.CSSProperties> = {
  connecting: { ...dot, background: "#888", animation: "none" },
  connected: {
    ...dot,
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  reconnecting: { ...dot, background: "#ef4444", animation: "none" },
  disconnected: { ...dot, background: "#888", animation: "none" },
};

export default function ConnectionIndicator({
  status,
}: {
  status: ConnectionStatus;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: status === "reconnecting" ? "#ef4444" : "#888",
      }}
    >
      <span style={styles[status]} />
      {status === "connecting" && "Conectando..."}
      {status === "connected" && "En vivo"}
      {status === "reconnecting" && "Reconectando..."}
      {status === "disconnected" && "Desconectado"}
    </div>
  );
}
