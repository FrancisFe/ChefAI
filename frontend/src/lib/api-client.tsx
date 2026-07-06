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
  id: number;
  title: string;
  description: string;
  cookingTime: number;
  servings: number;
  isFavorite: boolean;
  createdAt: string;
  steps: string;
  ingredients: Array<{
    name: string;
    quantity: number | null;
    unit: string | null;
  }>;
}

export const getRecipeHistory = async (favoritesOnly = false): Promise<RecipeHistoryItem[]> => {
  const response = await apiClient.get<RecipeHistoryItem[]>(`/recipe/user/history`, {
    params: { favoritesOnly }
  });
  return response.data;
};

export const addFavorite = async (recipeId: number): Promise<void> => {
  await apiClient.post(`/recipe/${recipeId}/favorite`);
};

export const removeFavorite = async (recipeId: number): Promise<void> => {
  await apiClient.delete(`/recipe/${recipeId}/favorite`);
};

// Detect ingredients from image
export interface DetectedIngredientsResponse {
  imageURL: string;
  ingredients: string;
}

export const detectIngredientsFromImage = async (
  file: File
): Promise<DetectedIngredientsResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<DetectedIngredientsResponse>(
    "/image/detect-ingredients",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Challenge feed & vote endpoints
export interface ChallengeFeedEntry {
  entryId: number;
  recipeId: number;
  recipeTitle: string;
  ownerUserId: number;
  ownerName: string;
  voteCount: number;
  hasVoted: boolean;
}

export interface PagedFeedResponse {
  items: ChallengeFeedEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

export interface ChallengeHistoryItem {
  id: number;
  starIngredientName: string;
  startDate: string;
  endDate: string;
  participationCount: number;
}

export const getChallengeFeed = async (challengeId: number, page: number = 1, pageSize: number = 20): Promise<PagedFeedResponse> => {
  const response = await apiClient.get<PagedFeedResponse>(`/challenge/${challengeId}/feed`, {
    params: { page, pageSize },
  });
  return response.data;
};

export const getChallengeHistory = async (): Promise<ChallengeHistoryItem[]> => {
  const response = await apiClient.get<ChallengeHistoryItem[]>(`/challenge/history`);
  return response.data;
};

export const voteChallengeEntry = async (entryId: number): Promise<void> => {
  await apiClient.post(`/challenge/entries/${entryId}/vote`);
};

export const removeVoteChallengeEntry = async (entryId: number): Promise<void> => {
  await apiClient.delete(`/challenge/entries/${entryId}/vote`);
};