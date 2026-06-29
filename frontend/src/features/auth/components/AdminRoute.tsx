import { Navigate } from "react-router-dom";
import { useAdmin } from "../hooks/useAdmin";
import type { ReactNode } from "react";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
