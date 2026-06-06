// app/saved/page.tsx
// Saved colleges page — server-rendered with auth check

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CollegeCard } from "@/components/college/CollegeCard";
import { EmptyState } from "@/components/ui";
import { CompareBar } from "@/components/compare/CompareBar";
import { SavedComparisonList } from "@/components/compare/SavedComparisonList";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Saved Colleges",
};

export default async function SavedPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/saved");
  }

  const saved = await prisma.savedCollege.findMany({
    where: { userId: session.user.id },
    include: {
      college: {
        select: {
          id: true,
          name: true,
          location: true,
          city: true,
          state: true,
          fees: true,
          rating: true,
          imageUrl: true,
          _count: { select: { courses: true, reviews: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const savedComparisons = await prisma.savedComparison.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const comparisonCollegeIds = [...new Set(savedComparisons.flatMap((comparison) => comparison.collegeIds))];
  const comparisonColleges = await prisma.college.findMany({
    where: { id: { in: comparisonCollegeIds } },
    select: {
      id: true,
      name: true,
      location: true,
      city: true,
      fees: true,
      rating: true,
      placements: {
        orderBy: { year: "desc" },
        take: 1,
        select: {
          avgPackage: true,
          highestPackage: true,
          placementRate: true,
          year: true,
        },
      },
    },
  });

  const collegeById = new Map(comparisonColleges.map((college) => [college.id, college]));
  const comparisons = savedComparisons.map((comparison) => ({
    ...comparison,
    colleges: comparison.collegeIds
      .map((id) => collegeById.get(id))
      .filter((college): college is typeof comparisonColleges[number] => Boolean(college)),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Saved Items
        </h1>
        <p className="text-gray-500">
          {saved.length + comparisons.length > 0
            ? `You've saved ${saved.length} college${saved.length !== 1 ? "s" : ""} and ${comparisons.length} comparison${comparisons.length !== 1 ? "s" : ""}`
            : "Your saved colleges will appear here"}
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-brand-600">Shortlist</p>
            <h2 className="text-2xl font-display font-bold text-gray-900">Saved colleges</h2>
          </div>
          {saved.length > 0 && (
            <Link href="/colleges" className="btn-secondary justify-center">
              Add colleges
            </Link>
          )}
        </div>

      {saved.length === 0 ? (
        <EmptyState
          message="No saved colleges yet"
          description="Browse colleges and click the heart icon to save them here."
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          }
        >
          <Link href="/colleges" className="btn-secondary mt-4 inline-flex">
            Browse Colleges
          </Link>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {saved.map(({ college }) => (
            <CollegeCard
              key={college.id}
              college={college}
              showCompare
              showSave
              initialSaved
            />
          ))}
        </div>
      )}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-brand-600">Decision sets</p>
            <h2 className="text-2xl font-display font-bold text-gray-900">Saved comparisons</h2>
          </div>
          {comparisons.length > 0 && (
            <Link href="/colleges" className="btn-secondary justify-center">
              Build another
            </Link>
          )}
        </div>
        <SavedComparisonList comparisons={comparisons} />
      </section>

      <CompareBar />
    </div>
  );
}
