/**
 * Health Store
 * 
 * A Zustand store used for managing global client-side UI state related to system health.
 * Demonstrates the use of selectors and actions in a simplified state model.
 */
import { create } from "zustand";

interface HealthState {
  /** Number of times the user has manually refreshed the health status */
  refreshCount: number;
  /** Increases the refresh count by one */
  incrementRefreshCount: () => void;
}

/**
 * Hook to access health-related global state.
 */
export const useHealthStore = create<HealthState>((set) => ({
  refreshCount: 0,
  incrementRefreshCount: () => set((state) => ({ refreshCount: state.refreshCount + 1 })),
}));
