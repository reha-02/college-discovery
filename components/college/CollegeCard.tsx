// components/college/CollegeCard.tsx
// College card with image, stats, save button, and compare toggle.

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCompareStore } from "@/lib/compare-store";
import { formatINR, cn } from "@/lib/utils";
import { StarRating, Badge, LoginPromptModal } from "@/components/ui";
import toast from "react-hot-toast";

interface CollegeCardProps {
  college: {
    id: number;
    name: string;
    location: string;
    city: string;
    fees: number;
    rating: number;
    imageUrl: string | null;
    _count?: { courses: number; reviews: number };
  };
  showCompare?: boolean;
  showSave?: boolean;
  initialSaved?: boolean;
  priority?: boolean;
}

export function CollegeCard({
  college,
  showCompare = true,
  showSave = true,
  initialSaved = false,
  priority = false,
}: CollegeCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addCollege, removeCollege, canAdd, isSelected } = useCompareStore();

  const [isSaved, setIsSaved] = useState(initialSaved);
  const [savePending, setSavePending] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const inCompare = isSelected(college.id);
  const compareDisabled = !inCompare && !canAdd;

  async function handleSaveToggle(e: React.MouseEvent) {
    e.preventDefault();
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    const newSaved = !isSaved;
    setIsSaved(newSaved);
    setSavePending(true);

    try {
      const res = await fetch("/api/saved", {
        method: newSaved ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: college.id }),
      });

      if (!res.ok) throw new Error();
      toast.success(newSaved ? "College saved" : "Removed from saved");
    } catch {
      setIsSaved(!newSaved);
      toast.error("Something went wrong");
    } finally {
      setSavePending(false);
    }
  }

  function handleCompareToggle(e: React.MouseEvent) {
    e.preventDefault();
    if (inCompare) {
      removeCollege(college.id);
      toast.success("Removed from compare");
    } else if (canAdd) {
      addCollege(college.id);
      toast.success("Added to compare");
    }
  }

  return (
    <>
      <Link href={`/colleges/${college.id}`} className="block group">
        <div className="card overflow-hidden group-hover:-translate-y-0.5 transition-transform duration-200">
          <div className="relative h-48 bg-gradient-to-br from-brand-100 to-brand-200 overflow-hidden">
            {college.imageUrl ? (
              <Image
                src={college.imageUrl}
                alt={college.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-brand-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            )}

            {showSave && (
              <button
                onClick={handleSaveToggle}
                disabled={savePending}
                aria-label={isSaved ? "Unsave college" : "Save college"}
                className={cn(
                  "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200",
                  isSaved
                    ? "bg-red-500 text-white"
                    : "bg-white/90 text-gray-500 hover:text-red-500 backdrop-blur-sm"
                )}
              >
                <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}

            <div className="absolute bottom-3 left-3">
              <Badge variant="info" className="bg-white/90 text-gray-700 backdrop-blur-sm border-0 shadow-sm">
                {college.city}
              </Badge>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1 line-clamp-2 group-hover:text-brand-700 transition-colors">
              {college.name}
            </h3>
            <p className="text-sm text-gray-500 mb-3">{college.location}</p>

            <div className="flex items-center gap-3 mb-4">
              <StarRating value={college.rating} size="sm" />
              {college._count && (
                <span className="text-xs text-gray-400">
                  {college._count.reviews} reviews
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Annual fees</p>
                <p className="text-lg font-bold text-gray-900">{formatINR(college.fees)}</p>
              </div>

              {showCompare && (
                <button
                  onClick={handleCompareToggle}
                  disabled={compareDisabled}
                  className={cn(
                    "text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-150",
                    inCompare
                      ? "bg-brand-600 text-white"
                      : compareDisabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  )}
                >
                  {inCompare ? "Added" : compareDisabled ? "Max 3" : "+ Compare"}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSignIn={() => router.push("/auth/signin")}
      />
    </>
  );
}
