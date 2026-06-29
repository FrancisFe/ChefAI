import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import axios from "axios";

export interface ActiveChallenge {
  id: number;
  starIngredientName: string;
  starIngredientId: number;
  startDate: string;
  endDate: string;
  status: string;
  hasParticipated: boolean;
}

export function useActiveChallenge() {
  return useQuery<ActiveChallenge>({
    queryKey: ["challenge", "active"],
    queryFn: async () => {
      const res = await apiClient.get<ActiveChallenge>("/challenge/active");
      return res.data;
    },
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 2,
  });
}
