import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import PointsBar from "../../gamification/components/PointsBar";
import Navbar from "../../../components/Navbar";

export default function ProtectedRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <PointsBar />
      <main style={{ flex: 1, padding: "24px", maxWidth: "900px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <Outlet />
      </main>
    </div>
  );
}