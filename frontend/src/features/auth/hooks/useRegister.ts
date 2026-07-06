import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import useAuthStore from "../../../store/authStore";
import { useNavigate } from "react-router-dom";

interface RegisterDto {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function useRegister() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      await apiClient.post("/auth/register", {
        userName: data.userName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      const loginRes = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      return loginRes.data;
    },

    onSuccess: (data) => {
      login(data);
      navigate("/");
    },
  });
}