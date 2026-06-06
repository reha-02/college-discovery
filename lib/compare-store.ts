// lib/compare-store.ts
// Zustand store for compare feature — persists to localStorage

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompareStore {
  selectedIds: number[];
  addCollege: (id: number) => void;
  removeCollege: (id: number) => void;
  clearAll: () => void;
  isSelected: (id: number) => boolean;
  canAdd: boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      selectedIds: [],
      canAdd: true,

      addCollege: (id: number) => {
        const { selectedIds } = get();
        // Max 3 colleges allowed
        if (selectedIds.length >= 3 || selectedIds.includes(id)) return;
        const next = [...selectedIds, id];
        set({ selectedIds: next, canAdd: next.length < 3 });
      },

      removeCollege: (id: number) => {
        const next = get().selectedIds.filter((c) => c !== id);
        set({ selectedIds: next, canAdd: next.length < 3 });
      },

      clearAll: () => set({ selectedIds: [], canAdd: true }),

      isSelected: (id: number) => get().selectedIds.includes(id),
    }),
    {
      name: "college-compare-store",
    }
  )
);
