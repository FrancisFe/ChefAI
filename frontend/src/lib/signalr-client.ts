import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";

export function createHubConnection(hubUrl: string): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => localStorage.getItem("token") ?? "",
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();
}

export const HUB_URLS = {
  ranking: `${import.meta.env.VITE_API_URL}/hubs/ranking`,
  notifications: `${import.meta.env.VITE_API_URL}/hubs/notifications`,
} as const;

export type HubName = keyof typeof HUB_URLS;
