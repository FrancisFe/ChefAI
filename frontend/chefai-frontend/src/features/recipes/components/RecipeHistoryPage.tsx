import { useRecipeHistory } from "../hooks/useRecipeHistory";
import "../../../App.css";

export default function RecipeHistoryPage() {
  const { data: recipes, isLoading, error } = useRecipeHistory();

  if (isLoading) {
    return <div className="container"><p>Cargando recetas...</p></div>;
  }

  if (error) {
    return (
      <div className="container">
        <p style={{ color: "red" }}>Error al cargar recetas: {error.message}</p>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="container">
        <h1>Mi Historial de Recetas</h1>
        <p>No tienes recetas guardadas aún.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Mi Historial de Recetas</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {recipes.map((recipe, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              backgroundColor: recipe.isFavorite ? "#fff9e6" : "#fff",
            }}
          >
            <h2>{recipe.title}</h2>
            <p>{recipe.description}</p>
            
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
              <p>⏱ {recipe.cookingTime} min — 🍽 {recipe.servings} porciones</p>
              {recipe.isFavorite && <p>⭐ Favorito</p>}
            </div>

            <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Ingredientes:</h3>
            <ul style={{ fontSize: "14px", marginBottom: "12px" }}>
              {recipe.ingredients.map((ing, i) => {
                const quantityText = ing.quantity === null || ing.unit === null ? "A gusto" : `${ing.quantity} ${ing.unit}`;
                return (
                  <li key={i}>
                    {quantityText} — {ing.name}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
