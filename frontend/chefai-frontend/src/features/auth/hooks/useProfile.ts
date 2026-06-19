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
  id?: number;
  Id?: number;
  email?: string;
  Email?: string;
  dietaryRestrictions?: Array<{ name?: string; Name?: string; description?: string; Description?: string }>;
  DietaryRestrictions?: Array<{ name?: string; Name?: string; description?: string; Description?: string }>;
  preferredDifficulty?: string;
  PreferredDifficulty?: string;
  maxCookingTime?: string;
  MaxCookingTime?: string;
  defaultServings?: number;
  DefaultServings?: number;
}

export function useProfile() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: ["profile", userId],
    enabled: userId != null,
    queryFn: async () => {
      const response = await apiClient.get(`/UserProfiles/${userId}`);
      const data = response.data as UserProfileApiResponse;
      const restrictions = data.dietaryRestrictions ?? data.DietaryRestrictions ?? [];
      return {
        id: data.id ?? data.Id ?? 0,
        email: data.email ?? data.Email ?? "",
        dietaryRestrictions: restrictions.map((dr) => ({
          name: dr.name ?? dr.Name ?? "",
          description: dr.description ?? dr.Description ?? ""
        })),
        preferredDifficulty: data.preferredDifficulty ?? data.PreferredDifficulty ?? "",
        maxCookingTime: data.maxCookingTime ?? data.MaxCookingTime ?? "00:00:00",
        defaultServings: data.defaultServings ?? data.DefaultServings ?? 1,
      } as UserProfile;
    },
  });
}
