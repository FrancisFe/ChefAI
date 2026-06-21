import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite, type RecipeHistoryItem } from "../../../lib/api-client";
import { toast } from "sonner";

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const invalidateRecipes = () => {
    queryClient.invalidateQueries({ queryKey: ["recipes"] });
  };

  const add = useMutation({
    mutationFn: (recipeId: number) => addFavorite(recipeId),
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey: ["recipes"] });

      const previousData = queryClient.getQueriesData<RecipeHistoryItem[]>({ queryKey: ["recipes"] });

      queryClient.setQueriesData<RecipeHistoryItem[]>({ queryKey: ["recipes"] }, (old) => {
        if (!old) return old;
        return old.map((r) => (r.id === recipeId ? { ...r, isFavorite: true } : r));
      });

      return { previousData };
    },
    onError: (_err, _recipeId, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error("No se pudo agregar a favoritos. Intenta de nuevo.");
    },
    onSettled: invalidateRecipes,
  });

  const remove = useMutation({
    mutationFn: (recipeId: number) => removeFavorite(recipeId),
    onMutate: async (recipeId) => {
      await queryClient.cancelQueries({ queryKey: ["recipes"] });

      const previousData = queryClient.getQueriesData<RecipeHistoryItem[]>({ queryKey: ["recipes"] });

      queryClient.setQueriesData<RecipeHistoryItem[]>({ queryKey: ["recipes"] }, (old) => {
        if (!old) return old;
        return old.map((r) => (r.id === recipeId ? { ...r, isFavorite: false } : r));
      });

      return { previousData };
    },
    onError: (_err, _recipeId, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error("No se pudo quitar de favoritos. Intenta de nuevo.");
    },
    onSettled: invalidateRecipes,
  });

  return { addFavorite: add, removeFavorite: remove };
}
