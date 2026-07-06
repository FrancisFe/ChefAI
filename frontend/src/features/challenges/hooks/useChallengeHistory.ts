import { useQuery } from "@tanstack/react-query";
import { getChallengeHistory, type ChallengeHistoryItem } from "../../../lib/api-client";

export function useChallengeHistory() {
  return useQuery<ChallengeHistoryItem[]>({
    queryKey: ["challenge", "history"],
    queryFn: () => getChallengeHistory(),
    staleTime: 1000 * 60 * 5,
  });
}
