import { useRecipeHistory } from "../hooks/useRecipeHistory";
import RecipeList from "./RecipeList";

export default function FavoritesPage() {
  const { data: recipes, isLoading, error } = useRecipeHistory(true);

  return (
    <RecipeList
      recipes={recipes}
      isLoading={isLoading}
      error={error}
      title="Mis Recetas Favoritas"
      emptyMessage="No tienes recetas favoritas aún."
    />
  );
}
