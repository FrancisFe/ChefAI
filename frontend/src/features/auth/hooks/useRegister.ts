import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { useNavigate } from "react-router-dom";

interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      const res = await apiClient.post("/auth/register", data);
      return res.data;
    },

    onSuccess: () => {
      navigate("/login");
    },
  });
}