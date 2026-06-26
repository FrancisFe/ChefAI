import { Outlet } from "react-router-dom";
import PointsBar from "./PointsBar";

export default function Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PointsBar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
