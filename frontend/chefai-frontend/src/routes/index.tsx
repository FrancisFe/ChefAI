import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LoginForm from "../features/auth/components/LoginForm";
import RegisterForm from "../features/auth/components/RegisterForm";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import RecipeGeneratorPage from "../features/recipes/components/RecipeGeneratorPage";
import RecipeHistoryPage from "../features/recipes/components/RecipeHistoryPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/generate-recipe",
        element: <RecipeGeneratorPage />,
      },
      {
        path: "/recipe-history",
        element: <RecipeHistoryPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/register",
    element: <RegisterForm />,
  },
]);
