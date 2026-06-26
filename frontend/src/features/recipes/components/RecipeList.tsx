import { useNavigate } from "react-router-dom";
import type { RecipeHistoryItem } from "../../../lib/api-client";
import RecipeCard from "./RecipeCard";

interface RecipeListProps {
  recipes: RecipeHistoryItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  title: string;
  emptyMessage: string;
  showFavoritesLink?: boolean;
}

export default function RecipeList({ recipes, isLoading, error, title, emptyMessage, showFavoritesLink }: RecipeListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container">
        <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>← Volver</button>
        <p>Cargando recetas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>← Volver</button>
        <p style={{ color: "red" }}>Error al cargar recetas: {error.message}</p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="container">
        <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>← Volver</button>
        <h1>{title}</h1>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>← Volver</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        {showFavoritesLink && (
          <button onClick={() => navigate("/favorites")} style={{ cursor: "pointer", padding: "8px 16px" }}>
            Ir a Favoritos
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
