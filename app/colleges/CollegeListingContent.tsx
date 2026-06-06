// app/colleges/CollegeListingContent.tsx
// Client component handling search, sorting, API state, and the college grid.

"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CollegeCard } from "@/components/college/CollegeCard";
import { EmptyState, Pagination, SkeletonCard, Button } from "@/components/ui";
import { debounce } from "@/lib/utils";
import { useColleges } from "@/lib/hooks/useColleges";

interface CollegeListingContentProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const SORT_OPTIONS = [
  { value: "rating", label: "Top rated" },
  { value: "fees-low", label: "Fees: low to high" },
  { value: "fees-high", label: "Fees: high to low" },
  { value: "name", label: "Name A-Z" },
];

function getSingle(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function CollegeListingContent({ searchParams }: CollegeListingContentProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const search = getSingle(searchParams.search);
  const page = parseInt(getSingle(searchParams.page) || "1", 10);
  const sort = getSingle(searchParams.sort) || "rating";

  const [searchInput, setSearchInput] = useState(search);
  const [isPending, startTransition] = useTransition();

  const { colleges, total, totalPages, isLoading, error, retry } = useColleges(searchParams);

  const activeFilters = [
    search && { key: "search", label: `Search: ${search}` },
    getSingle(searchParams.city) && { key: "city", label: `City: ${getSingle(searchParams.city)}` },
    getSingle(searchParams.minFees) && { key: "fees", label: "Fee range active" },
    getSingle(searchParams.minRating) && { key: "minRating", label: `${getSingle(searchParams.minRating)}+ rating` },
  ].filter(Boolean) as { key: string; label: string }[];

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      startTransition(() => {
        const params = new URLSearchParams(urlSearchParams.toString());
        params.set("page", "1");
        for (const [key, value] of Object.entries(updates)) {
          if (value) params.set(key, value);
          else params.delete(key);
        }
        router.push(`/colleges?${params.toString()}`);
      });
    },
    [router, urlSearchParams]
  );

  const debouncedSearch = useCallback(
    debounce((value: string) => updateParams({ search: value || undefined }), 250),
    [updateParams]
  );

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("page", String(newPage));
    router.push(`/colleges?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeFilter(key: string) {
    if (key === "fees") updateParams({ minFees: undefined, maxFees: undefined });
    else {
      if (key === "search") setSearchInput("");
      updateParams({ [key]: undefined });
    }
  }

  function clearFilters() {
    setSearchInput("");
    router.push("/colleges");
  }

  return (
    <div>
      <div className="sticky top-16 z-20 mb-5 rounded-lg border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by college, city, or location"
              className="input-base h-12 pl-12 pr-12 text-base"
            />
            {(isPending || isLoading) && (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <div className="w-4 h-4 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={sort}
              onChange={(event) => updateParams({ sort: event.target.value })}
              className="h-12 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <Button variant="ghost" onClick={retry} className="h-12 justify-center">
              Refresh
            </Button>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => removeFilter(filter.key)}
                className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
              >
                {filter.label} x
              </button>
            ))}
            <button onClick={clearFilters} className="text-xs font-bold text-gray-500 hover:text-red-500">
              Clear all
            </button>
          </div>
        )}
      </div>

      {!isLoading && total > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{colleges.length}</span> of{" "}
            <span className="font-semibold text-gray-800">{total}</span> colleges
          </p>
          <p className="hidden text-xs font-semibold uppercase text-gray-400 sm:block">Compare up to 3</p>
        </div>
      )}

      {error && !isLoading && colleges.length === 0 && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">{error}</p>
            <Button variant="danger" size="sm" onClick={retry}>Retry</Button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && colleges.length === 0 && (
        <EmptyState
          message="No colleges found"
          description="Try adjusting your search terms or clearing your filters."
          action={{ label: "Clear filters", onClick: clearFilters }}
        />
      )}

      {!isLoading && colleges.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 animate-fade-in sm:grid-cols-2 xl:grid-cols-3">
            {colleges.map((college, index) => (
              <CollegeCard key={college.id} college={college} showCompare showSave priority={index === 0} />
            ))}
          </div>

          <div className="mt-10">
            <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
          </div>
        </>
      )}
    </div>
  );
}
