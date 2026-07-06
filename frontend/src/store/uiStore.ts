import { create } from "zustand";

interface UiStore {
  socialMode: boolean;
  toggleMode: () => void;
  setSocialMode: (value: boolean) => void;
}

const useUiStore = create<UiStore>((set) => ({
  socialMode: false,
  toggleMode: () => set((s) => ({ socialMode: !s.socialMode })),
  setSocialMode: (value) => set({ socialMode: value }),
}));

export default useUiStore;
