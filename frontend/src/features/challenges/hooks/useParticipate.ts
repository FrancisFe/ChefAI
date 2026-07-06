import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { toast } from "sonner";
import axios from "axios";

export interface PointsResult {
  pointsEarned: number;
  totalPoints: number;
  currentLevel: number;
}

export function useParticipate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { challengeId: number; recipeId: number }) => {
      const res = await apiClient.post<PointsResult>(
        `/challenge/${args.challengeId}/participate`,
        { recipeId: args.recipeId }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification", "points"] });
      queryClient.invalidateQueries({ queryKey: ["gamification", "badges"] });
      queryClient.invalidateQueries({ queryKey: ["challenge"] });
    },
    onError: (err) => {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "No se pudo registrar tu participación.";
      toast.error(message);
    },
  });
}
