import { create } from "zustand";

interface HealthState {
  refreshCount: number;
  incrementRefreshCount: () => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  refreshCount: 0,
  incrementRefreshCount: () => set((state) => ({ refreshCount: state.refreshCount + 1 })),
}));
