import { useEffect, useRef } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { toast } from "sonner";
import { createHubConnection, HUB_URLS } from "../lib/signalr-client";
import useAuthStore from "../store/authStore";

interface BadgeEarnedPayload {
  badgeUnlocked: boolean;
  badgeName: string | null;
  badgeIcon: string | null;
}

export function useNotificationHub() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    const connection = createHubConnection(HUB_URLS.notifications);
    connectionRef.current = connection;

    connection.on("BadgeEarned", (data: BadgeEarnedPayload) => {
      toast.success(
        `🎖️ ¡Nuevo badge! ${data.badgeName ?? "Badge desbloqueado"}`,
        { duration: 5000 }
      );
    });

    connection.start().catch(() => {
      connectionRef.current = null;
    });

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [isLoggedIn]);
}
