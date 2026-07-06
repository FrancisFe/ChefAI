import { useInfiniteQuery } from "@tanstack/react-query";
import { getChallengeFeed, type ChallengeFeedEntry, type PagedFeedResponse } from "../../../lib/api-client";

export function useChallengeFeed(challengeId: number | null) {
  return useInfiniteQuery<PagedFeedResponse>({
    queryKey: ["challenge", "feed", challengeId],
    enabled: challengeId != null,
    queryFn: ({ pageParam }) => getChallengeFeed(challengeId!, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 2,
  });
}

export function flattenFeedPages(data: { pages: PagedFeedResponse[] } | undefined): ChallengeFeedEntry[] {
  if (!data?.pages) return [];
  return data.pages.flatMap(p => p.items);
}
