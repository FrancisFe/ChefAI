import { useEffect, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { createHubConnection, HUB_URLS } from "../../../lib/signalr-client";

export interface RankingEntry {
  entryId: number;
  recipeId: number;
  recipeTitle: string;
  ownerUserId: number;
  ownerName: string;
  voteCount: number;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

export function useRankingHub(challengeId: number | null) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (challengeId === null) return;

    const connection = createHubConnection(HUB_URLS.ranking);
    connectionRef.current = connection;
    setConnectionState("connecting");

    connection.on("RankingUpdated", (data: RankingEntry[]) => {
      setRanking(data);
    });

    connection.onreconnecting = () => {
      setConnectionState("reconnecting");
    };

    connection.onreconnected = () => {
      setConnectionState("connected");
    };

    connection.onclose = () => {
      setConnectionState("disconnected");
    };

    connection
      .start()
      .then(() => {
        setConnectionState("connected");
        return connection.invoke("JoinChallenge", String(challengeId));
      })
      .catch((err: Error) => {
        setError(err.message);
        setConnectionState("disconnected");
      });

    return () => {
      connection
        .invoke("LeaveChallenge", String(challengeId))
        .finally(() => {
          connection.stop();
        });
      connectionRef.current = null;
    };
  }, [challengeId]);

  return { ranking, connectionState, error };
}
