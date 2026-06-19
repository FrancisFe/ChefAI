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
      const response = await apiClient.get("/DietaryRestrictions");
      return (response.data as Array<{ name?: string; Name?: string; description?: string; Description?: string }>).map((item) => ({
        name: item.name ?? item.Name ?? "",
        description: item.description ?? item.Description ?? ""
      }));
    },
  });
}
