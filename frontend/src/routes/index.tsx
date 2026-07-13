import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LoginForm from "../features/auth/components/LoginForm";
import RegisterForm from "../features/auth/components/RegisterForm";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import ProfilePage from "../features/auth/components/ProfilePage";
import RecipeGeneratorPage from "../features/recipes/components/RecipeGeneratorPage";
import RecipeHistoryPage from "../features/recipes/components/RecipeHistoryPage";
import FavoritesPage from "../features/recipes/components/FavoritesPage";
import RecipeDetailPage from "../features/recipes/components/RecipeDetailPage";
import ChallengePage from "../features/challenges/components/ChallengePage";
import ChallengeLeaderboardPage from "../features/challenges/components/ChallengeLeaderboardPage";
import ChallengeRankingPage from "../features/challenges/components/ChallengeRankingPage";
import ChallengeHistoryPage from "../features/challenges/components/ChallengeHistoryPage";
import TotalRankingPage from "../features/challenges/components/TotalRankingPage";
import AdminChallengePage from "../features/challenges/components/AdminChallengePage";
import AdminRoute from "../features/auth/components/AdminRoute";

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
      {
        path: "/favorites",
        element: <FavoritesPage />,
      },
      {
        path: "/recipe/:id",
        element: <RecipeDetailPage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/challenge",
        element: <ChallengePage />,
      },
      {
        path: "/challenge/leaderboard",
        element: <ChallengeLeaderboardPage />,
      },
      {
        path: "/challenge/ranking",
        element: <ChallengeRankingPage />,
      },
      {
        path: "/challenge/history",
        element: <ChallengeHistoryPage />,
      },
      {
        path: "/challenge/ranking/total",
        element: <TotalRankingPage />,
      },
      {
        path: "/admin",
        element: <AdminRoute><AdminChallengePage /></AdminRoute>,
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
