import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type { UserProfile } from "./useProfile";
import useAuthStore from "../../../store/authStore";
import type { DietaryRestriction } from "./useDietaryRestrictions";

interface UpdateProfileDto {
  dietaryRestrictions: DietaryRestriction[];
  preferredDifficulty?: string;
  maxCookingTime?: string;
  defaultServings?: number;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: async (data: UpdateProfileDto) => {
      const response = await apiClient.put(`/UserProfiles/${userId}`, data);
      return response.data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
    },
  });
}
