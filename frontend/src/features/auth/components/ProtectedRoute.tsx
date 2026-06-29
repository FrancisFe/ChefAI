import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import PointsBar from "../../gamification/components/PointsBar";

export default function ProtectedRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PointsBar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}