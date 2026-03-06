/**
 * UI Store — Command Panel & Global UI State
 *
 * Manages floating command interface open/close state,
 * isolated from canvas rendering loops.
 */
import { create } from "zustand";

interface UIState {
  isCommandPanelOpen: boolean;
  toggleCommandPanel: () => void;
  closeCommandPanel: () => void;
  openCommandPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCommandPanelOpen: false,
  toggleCommandPanel: () =>
    set((state) => ({ isCommandPanelOpen: !state.isCommandPanelOpen })),
  closeCommandPanel: () => set({ isCommandPanelOpen: false }),
  openCommandPanel: () => set({ isCommandPanelOpen: true }),
}));
