// app/colleges/[id]/CollegeDetailClient.tsx
// Client-side college detail with tabs, placement chart, save button, and compare action.

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { StarRating, Tabs, Badge, LoginPromptModal } from "@/components/ui";
import { formatINR, formatPackage, formatDate } from "@/lib/utils";
import { useCompareStore } from "@/lib/compare-store";
import toast from "react-hot-toast";
import type { College, Course, Placement, Review } from "@prisma/client";

type CollegeWithRelations = College & {
  courses: Course[];
  placements: Placement[];
  reviews: (Review & { user: { name: string | null; image: string | null } })[];
  _count: { savedBy: number; reviews: number };
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses" },
  { id: "placements", label: "Placements" },
  { id: "reviews", label: "Reviews" },
];

export function CollegeDetailClient({ college }: { college: CollegeWithRelations }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addCollege, removeCollege, isSelected, canAdd } = useCompareStore();

  const inCompare = isSelected(college.id);

  async function handleSaveToggle() {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    const newSaved = !isSaved;
    setIsSaved(newSaved);
    try {
      await fetch("/api/saved", {
        method: newSaved ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: college.id }),
      });
      toast.success(newSaved ? "Saved" : "Removed from saved");
    } catch {
      setIsSaved(!newSaved);
      toast.error("Something went wrong");
    }
  }

  function handleCompareToggle() {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    if (inCompare) {
      removeCollege(college.id);
      toast.success("Removed from compare");
    } else if (canAdd) {
      addCollege(college.id);
      toast.success("Added to compare");
    } else {
      toast.error("Max 3 colleges in compare");
    }
  }

  const chartData = [...college.placements]
    .sort((a, b) => a.year - b.year)
    .map((p) => ({
      year: String(p.year),
      "Avg Package": Math.round(p.avgPackage / 100000),
      "Highest Package": Math.round(p.highestPackage / 100000),
    }));

  return (
    <>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link href="/colleges" className="hover:text-brand-600">Colleges</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{college.name}</span>
        </div>
      </div>

      <div className="relative h-72 md:h-96 bg-gradient-to-br from-brand-900 to-brand-700">
        {college.imageUrl && (
          <Image src={college.imageUrl} alt={college.name} fill priority className="object-cover opacity-40" />
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-5xl mx-auto px-4 pb-8 w-full">
            <Badge variant="info" className="mb-3 bg-white/20 text-white backdrop-blur-sm border border-white/30">
              {college.city}, {college.state}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3 leading-tight">
              {college.name}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <StarRating value={college.rating} size="md" />
              <span className="text-white/80 text-sm">
                {college._count.reviews} reviews - {college._count.savedBy} saved
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">{formatINR(college.fees)}</span>
            <span className="text-sm text-gray-400">/ year</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                isSaved ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-500"
              }`}
            >
              <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isSaved ? "Saved" : "Save"}
            </button>
            <button
              onClick={handleCompareToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                inCompare ? "bg-brand-600 text-white" : "btn-secondary"
              }`}
            >
              {inCompare ? "In compare" : "+ Compare"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-8 animate-fade-in" key={activeTab}>
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">{college.description}</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Annual fees", value: formatINR(college.fees) },
                  { label: "Rating", value: `${college.rating} / 5.0` },
                  { label: "Location", value: college.location },
                  { label: "Courses", value: `${college.courses.length} programs` },
                ].map((stat) => (
                  <div key={stat.label} className="card p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{stat.label}</p>
                    <p className="font-semibold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Programs offered</h2>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Annual fees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {college.courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-medium text-gray-900">{course.name}</td>
                        <td className="px-5 py-4 text-gray-500 text-sm">{course.duration}</td>
                        <td className="px-5 py-4 text-right font-semibold text-brand-700">{formatINR(course.fees)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "placements" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Placement statistics</h2>

              {college.placements[0] && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Avg package (2024)", value: formatPackage(college.placements[0].avgPackage) },
                    { label: "Highest package (2024)", value: formatPackage(college.placements[0].highestPackage) },
                    { label: "Placement rate (2024)", value: `${college.placements[0].placementRate.toFixed(1)}%` },
                  ].map((stat) => (
                    <div key={stat.label} className="card p-5 text-center">
                      <p className="text-2xl font-bold text-brand-700 mb-1">{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Package trends in lakhs</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} unit="L" />
                    <Tooltip
                      formatter={(value) => [`INR ${Number(value ?? 0)}L`, ""]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "13px" }} />
                    <Bar dataKey="Avg Package" fill="#4f52e7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Highest Package" fill="#00c9a7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card overflow-hidden mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg package</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Highest</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {college.placements.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-semibold text-gray-900">{p.year}</td>
                        <td className="px-5 py-4 text-right text-gray-700">{formatPackage(p.avgPackage)}</td>
                        <td className="px-5 py-4 text-right text-gray-700">{formatPackage(p.highestPackage)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-600">{p.placementRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Student reviews</h2>
              {college.reviews.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {college.reviews.map((review) => (
                    <div key={review.id} className="card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                            {review.user.name?.[0] ?? "U"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{review.user.name ?? "Student"}</p>
                            <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <StarRating value={review.rating} size="sm" />
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSignIn={() => router.push("/auth/signin")}
      />
    </>
  );
}
