import { useQuery } from "@tanstack/react-query";
import { getRecipeHistory, type RecipeHistoryItem } from "../../../lib/api-client";
import useAuthStore from "../../../store/authStore";

export const useRecipeHistory = (favoritesOnly = false) => {
  const userId = useAuthStore((s) => s.userId);
  const queryKey = favoritesOnly ? ["recipes", "favorites", userId] : ["recipes", "history", userId];

  return useQuery<RecipeHistoryItem[]>({
    queryKey,
    queryFn: () => {
      if (!userId) throw new Error("User ID not found");
      return getRecipeHistory(favoritesOnly);
    },
    enabled: !!userId,
  });
};
