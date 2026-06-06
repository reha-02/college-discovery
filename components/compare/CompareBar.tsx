// components/compare/CompareBar.tsx
// Responsive floating bar showing selected colleges and the compare action.

"use client";

import { useRouter } from "next/navigation";
import { useCompareStore } from "@/lib/compare-store";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const router = useRouter();
  const { selectedIds, removeCollege, clearAll } = useCompareStore();

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 animate-slide-up sm:inset-x-auto sm:left-1/2 sm:bottom-6 sm:-translate-x-1/2">
      <div className="rounded-lg border border-gray-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md sm:flex sm:items-center sm:gap-3 sm:px-5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }, (_, i) => {
              const id = selectedIds[i];
              return (
                <div
                  key={i}
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center text-xs font-black transition-all sm:h-12 sm:w-12",
                    id
                      ? "bg-brand-600 text-white"
                      : "border-2 border-dashed border-gray-200 text-gray-300"
                  )}
                >
                  {id ? (
                    <div className="relative flex h-full w-full items-center justify-center">
                      <span>{i + 1}</span>
                      <button
                        onClick={() => removeCollege(id)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                        aria-label="Remove from compare"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    "+"
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-right sm:hidden">
            <p className="text-sm font-black text-gray-900">{selectedIds.length}/3 selected</p>
            <button onClick={clearAll} className="text-xs font-bold text-gray-400 hover:text-red-500">Clear</button>
          </div>
        </div>

        <div className="my-3 h-px bg-gray-200 sm:my-0 sm:h-8 sm:w-px" />

        <div className="flex items-center justify-between gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <p className="text-sm font-semibold text-gray-600">{selectedIds.length}/3 selected</p>
            <button onClick={clearAll} className="rounded-lg px-2 py-1 text-xs text-gray-400 transition hover:bg-red-50 hover:text-red-500">
              Clear
            </button>
          </div>

          <button
            onClick={() => router.push(`/compare?ids=${selectedIds.join(",")}`)}
            disabled={selectedIds.length < 2}
            className="btn-primary min-h-11 flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            Compare now
          </button>
        </div>
      </div>
    </div>
  );
}
