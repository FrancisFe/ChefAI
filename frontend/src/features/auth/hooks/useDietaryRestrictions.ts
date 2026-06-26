import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";

export interface DietaryRestriction {
  name: string;
  description: string;
}

export function useDietaryRestrictions() {
  return useQuery({
    queryKey: ["dietary-restrictions"],
    queryFn: async () => {
      const response = await apiClient.get<Array<{ name: string; description: string | null }>>("/DietaryRestrictions");
      return response.data.map((item) => ({
        name: item.name,
        description: item.description ?? ""
      }));
    },
  });
}
