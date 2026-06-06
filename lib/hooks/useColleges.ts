// lib/hooks/useColleges.ts
// Hook to fetch college listing from /api/colleges with filters.

"use client";

import { useState, useEffect } from "react";
import { buildQueryString } from "@/lib/utils";

interface CollegeSummary {
  id: number;
  name: string;
  location: string;
  city: string;
  state: string;
  fees: number;
  rating: number;
  imageUrl: string | null;
  _count: { courses: number; reviews: number };
}

interface UseCollegesResult {
  colleges: CollegeSummary[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  source: "database" | "fallback" | null;
  retry: () => void;
}

export function useColleges(
  searchParams: Record<string, string | string[] | undefined>
): UseCollegesResult {
  const [colleges, setColleges] = useState<CollegeSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"database" | "fallback" | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const params: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(searchParams)) {
      if (typeof v === "string") params[k] = v;
    }

    const qs = buildQueryString(params);
    const controller = new AbortController();
    let cancelled = false;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 12000);

    setIsLoading(true);
    setError(null);

    fetch(`/api/colleges?${qs}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json() as Promise<{
          colleges: CollegeSummary[];
          total: number;
          totalPages: number;
          source?: "database" | "fallback";
        }>;
      })
      .then((data) => {
        setColleges(data.colleges);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setSource(data.source ?? "database");
      })
      .catch(() => {
        if (cancelled) return;
        const message = "Colleges are taking longer than expected. Please try again.";
        setError(message);
        setSource(null);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      if (!timedOut) controller.abort();
    };
  }, [
    searchParams.page,
    searchParams.city,
    searchParams.search,
    searchParams.minFees,
    searchParams.maxFees,
    searchParams.minRating,
    searchParams.sort,
    retryKey,
  ]);

  return {
    colleges,
    total,
    totalPages,
    isLoading,
    error,
    source,
    retry: () => setRetryKey((key) => key + 1),
  };
}
