// components/compare/SavedComparisonList.tsx
// Client list for saved comparison sets with remove actions.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button, StarRating } from "@/components/ui";
import { formatINR, formatPackage } from "@/lib/utils";

interface SavedComparisonCollege {
  id: number;
  name: string;
  location: string;
  city: string;
  fees: number;
  rating: number;
  placements: {
    avgPackage: number;
    highestPackage: number;
    placementRate: number;
    year: number;
  }[];
}

interface SavedComparison {
  id: number;
  title: string;
  collegeIds: number[];
  createdAt: Date | string;
  colleges: SavedComparisonCollege[];
}

interface SavedComparisonListProps {
  comparisons: SavedComparison[];
}

export function SavedComparisonList({ comparisons }: SavedComparisonListProps) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<number | null>(null);

  async function removeComparison(id: number) {
    setRemovingId(id);
    try {
      const res = await fetch("/api/saved-comparisons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error();
      toast.success("Saved comparison removed");
      router.refresh();
    } catch {
      toast.error("Could not remove comparison");
    } finally {
      setRemovingId(null);
    }
  }

  if (comparisons.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-gray-900">No saved comparisons yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Compare two or three colleges, then save that set here for later.
        </p>
        <Link href="/colleges" className="btn-secondary mt-5 inline-flex">
          Build a comparison
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {comparisons.map((comparison) => (
        <article key={comparison.id} className="card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-950">{comparison.title}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {comparison.colleges.length} colleges saved for comparison
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/compare?ids=${comparison.collegeIds.join(",")}`} className="btn-primary justify-center">
                Open
              </Link>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeComparison(comparison.id)}
                loading={removingId === comparison.id}
              >
                Remove
              </Button>
            </div>
          </div>

          <div className="mt-5 divide-y divide-gray-100 rounded-lg border border-gray-100">
            {comparison.colleges.map((college) => {
              const latestPlacement = college.placements[0];

              return (
                <div key={college.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <Link href={`/colleges/${college.id}`} className="font-bold text-gray-950 hover:text-brand-700">
                      {college.name}
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">{college.location}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase text-gray-400">Fees</p>
                      <p className="font-bold text-gray-900">{formatINR(college.fees)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-400">Rating</p>
                      <StarRating value={college.rating} size="sm" />
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-400">Avg package</p>
                      <p className="font-bold text-gray-900">
                        {latestPlacement ? formatPackage(latestPlacement.avgPackage) : "No data"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
