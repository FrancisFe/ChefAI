import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import useAuthStore from "../../../store/authStore";
import type { DietaryRestriction } from "./useDietaryRestrictions";

export interface UserProfile {
  id: number;
  email: string;
  dietaryRestrictions: DietaryRestriction[];
  preferredDifficulty: string;
  maxCookingTime: string;
  defaultServings: number;
}

interface UserProfileApiResponse {
  id: number;
  email: string;
  dietaryRestrictions: Array<{ name: string; description: string | null }>;
  preferredDifficulty: string;
  maxCookingTime: string;
  defaultServings: number;
}

export function useProfile() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: ["profile", userId],
    enabled: userId != null,
    queryFn: async () => {
      const response = await apiClient.get(`/UserProfiles/${userId}`);
      const data = response.data as UserProfileApiResponse;
      return {
        id: data.id,
        email: data.email,
        dietaryRestrictions: data.dietaryRestrictions.map((dr) => ({
          name: dr.name,
          description: dr.description ?? ""
        })),
        preferredDifficulty: data.preferredDifficulty,
        maxCookingTime: data.maxCookingTime,
        defaultServings: data.defaultServings,
      } as UserProfile;
    },
  });
}
