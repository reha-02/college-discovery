// app/compare/page.tsx
// Responsive comparison flow with API timeout, retry, and best-value highlights.

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCompareStore } from "@/lib/compare-store";
import { formatINR, formatPackage, cn } from "@/lib/utils";
import { StarRating, EmptyState, Button } from "@/components/ui";
import { AuthRequired } from "@/components/auth/AuthRequired";
import toast from "react-hot-toast";
import type { College, Course, Placement } from "@prisma/client";

type CompareCollege = College & {
  courses: Course[];
  placements: Placement[];
  _count: { courses: number };
};

type LoadState = "idle" | "loading" | "success" | "error";

export default function ComparePage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedIds, clearAll, removeCollege } = useCompareStore();

  const [colleges, setColleges] = useState<CompareCollege[]>([]);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const idsParam = searchParams.get("ids") || selectedIds.join(",");
  const ids = idsParam.split(",").filter(Boolean);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (ids.length < 2) return;

    const controller = new AbortController();
    let cancelled = false;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);
    setState("loading");
    setError(null);

    fetch(`/api/compare?ids=${ids.join(",")}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Comparison data is unavailable.");
        return res.json() as Promise<{ colleges: CompareCollege[] }>;
      })
      .then((data) => {
        setColleges(data.colleges);
        setState("success");
      })
      .catch(() => {
        if (cancelled) return;
        const message = "Comparison is taking too long. Try again or choose fewer colleges.";
        setError(message);
        setState("error");
        toast.error(message);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (cancelled) return;
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      if (!timedOut) controller.abort();
    };
  }, [idsParam, retryKey, status]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="card p-8">
          <div className="skeleton h-8 w-1/2" />
          <div className="mt-4 skeleton h-4 w-3/4" />
          <div className="mt-6 skeleton h-11 w-44" />
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <AuthRequired title="Sign in to compare colleges" />;
  }

  function handleRemove(id: number) {
    removeCollege(id);
    const next = ids.filter((value) => value !== String(id));
    if (next.length < 2) router.push("/colleges");
    else router.push(`/compare?ids=${next.join(",")}`);
  }

  function handleClearAll() {
    clearAll();
    router.push("/colleges");
  }

  async function handleSaveComparison() {
    if (ids.length < 2 || ids.length > 3) return;

    setSavePending(true);
    try {
      const res = await fetch("/api/saved-comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeIds: ids.map(Number) }),
      });

      if (!res.ok) throw new Error();
      toast.success("Comparison saved");
    } catch {
      toast.error("Could not save comparison");
    } finally {
      setSavePending(false);
    }
  }

  const latestPlacements = useMemo(
    () => colleges.map((college) => [...college.placements].sort((a, b) => b.year - a.year)[0] ?? null),
    [colleges]
  );

  const rows = useMemo(
    () => [
      {
        label: "Annual fees",
        values: colleges.map((college) => formatINR(college.fees)),
        rawValues: colleges.map((college) => college.fees),
        lowerIsBetter: true,
      },
      {
        label: "Rating",
        values: colleges.map((college) => <StarRating key={college.id} value={college.rating} size="sm" />),
        rawValues: colleges.map((college) => college.rating),
      },
      {
        label: "Location",
        values: colleges.map((college) => college.location),
        rawValues: [],
      },
      {
        label: "Avg package",
        values: latestPlacements.map((placement) => (placement ? formatPackage(placement.avgPackage) : "No data")),
        rawValues: latestPlacements.map((placement) => placement?.avgPackage ?? 0),
      },
      {
        label: "Highest package",
        values: latestPlacements.map((placement) => (placement ? formatPackage(placement.highestPackage) : "No data")),
        rawValues: latestPlacements.map((placement) => placement?.highestPackage ?? 0),
      },
      {
        label: "Placement rate",
        values: latestPlacements.map((placement) => (placement ? `${placement.placementRate.toFixed(1)}%` : "No data")),
        rawValues: latestPlacements.map((placement) => placement?.placementRate ?? 0),
      },
      {
        label: "Courses",
        values: colleges.map((college) => `${college._count.courses} programs`),
        rawValues: colleges.map((college) => college._count.courses),
      },
    ],
    [colleges, latestPlacements]
  );

  function getBestIndex(values: number[], lowerIsBetter = false) {
    if (values.length < 2) return -1;
    return values.indexOf(lowerIsBetter ? Math.min(...values) : Math.max(...values));
  }

  if (ids.length < 2) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          message="No comparison yet"
          description="Sign in, then select at least two colleges from the listing to start comparing."
          action={{ label: "Browse colleges", onClick: () => router.push("/colleges") }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-brand-600">Comparison workspace</p>
          <h1 className="mt-1 text-3xl font-black text-gray-950">Compare colleges side by side</h1>
          <p className="mt-2 text-sm text-gray-500">
            Best values are highlighted automatically. Remove choices anytime without losing the flow.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={handleSaveComparison}
            loading={savePending}
            disabled={state !== "success" || colleges.length < 2}
          >
            Save comparison
          </Button>
          <Button variant="ghost" onClick={() => setRetryKey((key) => key + 1)}>Refresh</Button>
          <Button variant="ghost" onClick={handleClearAll}>Clear all</Button>
          <Link href="/colleges" className="btn-secondary justify-center">Add colleges</Link>
        </div>
      </div>

      {state === "loading" && (
        <div className="grid gap-4 md:grid-cols-3">
          {ids.map((id) => (
            <div key={id} className="card p-5">
              <div className="skeleton h-6 w-2/3" />
              <div className="mt-5 space-y-3">
                <div className="skeleton h-12" />
                <div className="skeleton h-12" />
                <div className="skeleton h-12" />
              </div>
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">{error}</p>
            <Button variant="danger" onClick={() => setRetryKey((key) => key + 1)}>Try again</Button>
          </div>
        </div>
      )}

      {state === "success" && colleges.length >= 2 && (
        <>
          <div className="mb-5 grid gap-4 md:grid-cols-3">
            {colleges.map((college) => (
              <div key={college.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/colleges/${college.id}`} className="font-bold text-gray-950 hover:text-brand-700">
                      {college.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">{college.city}</p>
                  </div>
                  <button onClick={() => handleRemove(college.id)} className="rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50">
                    Remove
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">Fees</p>
                    <p className="font-black text-gray-950">{formatINR(college.fees)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">Rating</p>
                    <p className="font-black text-gray-950">{college.rating.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="w-44 px-6 py-4 text-left text-xs font-black uppercase tracking-wide text-gray-400">
                      Criteria
                    </th>
                    {colleges.map((college) => (
                      <th key={college.id} className="px-6 py-4 text-center text-sm font-black text-gray-900">
                        {college.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => {
                    const bestIndex = getBestIndex(row.rawValues, row.lowerIsBetter);
                    return (
                      <tr key={row.label} className={cn("border-b border-gray-50", rowIndex % 2 ? "bg-gray-50/50" : "bg-white")}>
                        <td className="px-6 py-4 text-sm font-bold text-gray-500">{row.label}</td>
                        {colleges.map((college, columnIndex) => (
                          <td
                            key={`${college.id}-${row.label}`}
                            className={cn(
                              "px-6 py-4 text-center text-sm",
                              bestIndex === columnIndex && row.rawValues.length >= 2
                                ? "bg-emerald-50 font-black text-emerald-800"
                                : "text-gray-700"
                            )}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {row.values[columnIndex]}
                              {bestIndex === columnIndex && row.rawValues.length >= 2 && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">
                                  Best
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
