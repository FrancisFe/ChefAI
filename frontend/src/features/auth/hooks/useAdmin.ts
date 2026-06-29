import useAuthStore from "../../../store/authStore";

export function useAdmin() {
  const token = useAuthStore((s) => s.token);

  if (!token) return { isAdmin: false };

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { isAdmin: payload.role === "Admin" };
  } catch {
    return { isAdmin: false };
  }
}
