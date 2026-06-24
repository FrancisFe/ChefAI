import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import useAuthStore from "../../../store/authStore";

export interface PointsData {
  totalPoints: number;
  currentStreak: number;
  currentLevel: number;
}

export interface BadgeStatus {
  id: number;
  name: string;
  description: string | null;
  iconUrl: string;
  isUnlocked: boolean;
}

export function usePoints() {
  const userId = useAuthStore((s) => s.userId);

  return useQuery({
    queryKey: ["gamification", "points", userId],
    enabled: userId != null,
    queryFn: async () => {
      const res = await apiClient.get<PointsData>("/gamification/points");
      return res.data;
    },
  });
}

export function useBadges() {
  const userId = useAuthStore((s) => s.userId);

  return useQuery({
    queryKey: ["gamification", "badges", userId],
    enabled: userId != null,
    queryFn: async () => {
      const res = await apiClient.get<BadgeStatus[]>("/gamification/badges");
      return res.data;
    },
  });
}
