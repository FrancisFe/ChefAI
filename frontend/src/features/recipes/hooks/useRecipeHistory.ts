import { useQuery } from "@tanstack/react-query";
import { getRecipeHistory, type RecipeHistoryItem } from "../../../lib/api-client";

export const useRecipeHistory = (favoritesOnly = false) => {
  return useQuery<RecipeHistoryItem[]>({
    queryKey: ["recipes", favoritesOnly ? "favorites" : "history"],
    queryFn: () => getRecipeHistory(favoritesOnly),
  });
};
