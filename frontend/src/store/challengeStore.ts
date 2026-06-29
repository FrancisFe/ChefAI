import { create } from "zustand";

interface ChallengeStore {
  isChallengeMode: boolean;
  activeChallengeId: number | null;
  starIngredientName: string | null;
  enterChallenge: (id: number, name: string) => void;
  exitChallenge: () => void;
}

const useChallengeStore = create<ChallengeStore>((set) => ({
  isChallengeMode: false,
  activeChallengeId: null,
  starIngredientName: null,
  enterChallenge: (id, name) =>
    set({ isChallengeMode: true, activeChallengeId: id, starIngredientName: name }),
  exitChallenge: () =>
    set({ isChallengeMode: false, activeChallengeId: null, starIngredientName: null }),
}));

export default useChallengeStore;
