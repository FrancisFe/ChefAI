import { useRecipeHistory } from "../hooks/useRecipeHistory";
import RecipeList from "./RecipeList";

export default function RecipeHistoryPage() {
  const { data: recipes, isLoading, error } = useRecipeHistory(false);

  return (
    <RecipeList
      recipes={recipes}
      isLoading={isLoading}
      error={error}
      title="Mi Historial de Recetas"
      emptyMessage="No tienes recetas guardadas aún."
      showFavoritesLink
    />
  );
}
