import { useQuery } from "@tanstack/react-query";
import { getRecipeHistory, type RecipeHistoryItem } from "../../../lib/api-client";
import useAuthStore from "../../../store/authStore";

export const useRecipeHistory = () => {
  const userId = useAuthStore((s) => s.userId);

  return useQuery<RecipeHistoryItem[]>({
    queryKey: ["recipes", "history", userId],
    queryFn: () => {
      if (!userId) throw new Error("User ID not found");
      return getRecipeHistory();
    },
    enabled: !!userId, // Solo ejecutar si tenemos userId
  });
};
