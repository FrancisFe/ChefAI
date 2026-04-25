import axios from "axios";
import useAuthStore from "../store/authStore";

const AUTH_TOKEN_KEY = "token";

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, login, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
          {
            refreshToken,
          }
        );
        login(res.data);
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;

        return apiClient(originalRequest);
      } catch (err) {
        logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Recipe API endpoints
export interface RecipeHistoryItem {
  title: string;
  description: string;
  cookingTime: number;
  servings: number;
  isFavorite: boolean;
  ingredients: Array<{
    name: string;
    quantity: number | null;
    unit: string | null;
  }>;
}

export const getRecipesByUserId = async (userId: number): Promise<RecipeHistoryItem[]> => {
  const response = await apiClient.get<RecipeHistoryItem[]>(`/recipe/user`, {
    params: { userId },
  });
  return response.data;
};