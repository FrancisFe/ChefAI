import useAuthStore from "../../../store/authStore";

export function useAdmin() {
  const token = useAuthStore((s) => s.token);

  if (!token) return { isAdmin: false };

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { isAdmin: payload.role === "Admin" || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Admin" };
  } catch {
    return { isAdmin: false };
  }
}
