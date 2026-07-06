import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voteChallengeEntry, removeVoteChallengeEntry, type ChallengeFeedEntry, type PagedFeedResponse } from "../../../lib/api-client";
import { toast } from "sonner";

type InfiniteFeedData = { pages: PagedFeedResponse[]; pageParams: (number | undefined)[] };

export function useVote(challengeId: number) {
  const queryClient = useQueryClient();
  const queryKey = ["challenge", "feed", challengeId];

  const invalidateFeed = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["gamification", "points"] });
    queryClient.invalidateQueries({ queryKey: ["gamification", "badges"] });
  };

  const updateEntry = (data: InfiniteFeedData | undefined, entryId: number, updater: (e: ChallengeFeedEntry) => ChallengeFeedEntry): InfiniteFeedData | undefined => {
    if (!data) return data;
    return {
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        items: page.items.map(e => e.entryId === entryId ? updater(e) : e),
      })),
    };
  };

  const vote = useMutation({
    mutationFn: (entryId: number) => voteChallengeEntry(entryId),
    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<InfiniteFeedData>(queryKey);

      queryClient.setQueryData<InfiniteFeedData>(queryKey, (old) =>
        updateEntry(old, entryId, (e) => ({ ...e, hasVoted: true, voteCount: e.voteCount + 1 }))
      );

      return { previousData };
    },
    onError: (_err, _entryId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error("No se pudo registrar el voto. Intenta de nuevo.");
    },
    onSettled: invalidateFeed,
  });

  const unvote = useMutation({
    mutationFn: (entryId: number) => removeVoteChallengeEntry(entryId),
    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<InfiniteFeedData>(queryKey);

      queryClient.setQueryData<InfiniteFeedData>(queryKey, (old) =>
        updateEntry(old, entryId, (e) => ({ ...e, hasVoted: false, voteCount: Math.max(0, e.voteCount - 1) }))
      );

      return { previousData };
    },
    onError: (_err, _entryId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error("No se pudo quitar el voto. Intenta de nuevo.");
    },
    onSettled: invalidateFeed,
  });

  return { vote, unvote };
}
