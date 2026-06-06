// components/college/CollegeFilters.tsx
// Filter sidebar for city, fee range, and minimum rating.

"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Chandigarh",
];

const RATINGS = [4.5, 4.0, 3.5, 3.0];

const FEE_RANGES = [
  { label: "Under INR 1L", min: 0, max: 100000 },
  { label: "INR 1L - INR 3L", min: 100000, max: 300000 },
  { label: "INR 3L - INR 5L", min: 300000, max: 500000 },
  { label: "Above INR 5L", min: 500000, max: undefined },
];

export function CollegeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCity = searchParams.get("city") ?? "";
  const currentMinFees = searchParams.get("minFees");
  const currentMaxFees = searchParams.get("maxFees");
  const currentMinRating = searchParams.get("minRating");

  const updateFilter = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      router.push(`/colleges?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearAllFilters() {
    const search = searchParams.get("search");
    router.push(search ? `/colleges?search=${encodeURIComponent(search)}` : "/colleges");
  }

  const hasActiveFilters = currentCity || currentMinFees || currentMaxFees || currentMinRating;

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="card p-5 lg:sticky lg:top-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-800">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">City</p>
          <div className="grid grid-cols-2 gap-1 lg:block lg:space-y-1">
            <button
              onClick={() => updateFilter({ city: undefined })}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                !currentCity ? "bg-brand-50 text-brand-700 font-medium" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              All cities
            </button>
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => updateFilter({ city: currentCity === city ? undefined : city })}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                  currentCity === city
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {city}
                {currentCity === city && (
                  <svg className="w-3.5 h-3.5 text-brand-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Annual fees</p>
          <div className="grid grid-cols-2 gap-1 lg:block lg:space-y-1">
            {FEE_RANGES.map((range) => {
              const isActive =
                currentMinFees === String(range.min) &&
                (range.max === undefined ? !currentMaxFees : currentMaxFees === String(range.max));

              return (
                <button
                  key={range.label}
                  onClick={() =>
                    updateFilter(
                      isActive
                        ? { minFees: undefined, maxFees: undefined }
                        : {
                            minFees: String(range.min),
                            maxFees: range.max !== undefined ? String(range.max) : undefined,
                          }
                    )
                  }
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive ? "bg-brand-50 text-brand-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Minimum rating</p>
          <div className="grid grid-cols-2 gap-1 lg:block lg:space-y-1">
            {RATINGS.map((rating) => {
              const isActive = currentMinRating === String(rating);
              return (
                <button
                  key={rating}
                  onClick={() =>
                    updateFilter({ minRating: isActive ? undefined : String(rating) })
                  }
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                    isActive ? "bg-brand-50 text-brand-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {rating}+ and above
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
