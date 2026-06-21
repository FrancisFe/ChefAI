import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import './App.css'

function App() {
  const syncAuthState = useAuthStore((s) => s.syncAuthState);
  const navigate = useNavigate();

  useEffect(() => {
    syncAuthState();
  }, [syncAuthState]);
  
  return (
    <div>
      <h1>ChefAI - Home</h1>
      <p>¡Bienvenido!</p>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => navigate("/generate-recipe")}>Generar Receta</button>
        <button onClick={() => navigate("/recipe-history")}>Mi Historial</button>
        <button onClick={() => navigate("/favorites")}>Mis Favoritos</button>
        <button onClick={() => navigate("/profile")}>Mi Perfil</button>
        <button onClick={() => useAuthStore.getState().logout()}>Cerrar sesión</button>
      </div>
    </div>
  )
}

export default App;