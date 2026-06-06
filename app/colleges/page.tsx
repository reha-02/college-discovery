// app/colleges/page.tsx
// College listing page with search bar, filter sidebar, and paginated grid.

import { Suspense } from "react";
import type { Metadata } from "next";
import { CollegeListingContent } from "./CollegeListingContent";
import { CollegeFilters } from "@/components/college/CollegeFilters";
import { CompareBar } from "@/components/compare/CompareBar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthRequired } from "@/components/auth/AuthRequired";

export const metadata: Metadata = {
  title: "Browse Colleges",
  description: "Explore top engineering, management, and science colleges across India.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CollegesPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;

  if (!session?.user) {
    return <AuthRequired />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Browse Colleges</h1>
        <p className="text-gray-500">Discover and compare top colleges across India</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <Suspense fallback={<div className="w-64 shrink-0" />}>
          <CollegeFilters />
        </Suspense>

        <div className="flex-1 min-w-0">
          <Suspense fallback={<CollegeListingSkeleton />}>
            <CollegeListingContent searchParams={resolvedSearchParams} />
          </Suspense>
        </div>
      </div>

      <CompareBar />
    </div>
  );
}

function CollegeListingSkeleton() {
  return (
    <div>
      <div className="h-12 skeleton rounded-lg mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card p-0 overflow-hidden">
            <div className="skeleton h-48 rounded-none rounded-t-lg" />
            <div className="p-5 space-y-3">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-9 w-full rounded-lg mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
