import { Navigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import Layout from "../../gamification/components/Layout";

export default function ProtectedRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}