// types/index.ts
// Shared TypeScript types used across the application

import type { College, Course, Placement, Review } from "@prisma/client";

// ─── API response types ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
}

// ─── College with relations ───────────────────────────────────────────────────

export type CollegeWithRelations = College & {
  courses: Course[];
  placements: Placement[];
  reviews: ReviewWithUser[];
  _count: {
    savedBy: number;
    reviews: number;
  };
};

export type CollegeSummary = Pick<College, "id" | "name" | "location" | "city" | "state" | "fees" | "rating" | "imageUrl">;

// ─── Review with user ─────────────────────────────────────────────────────────

export type ReviewWithUser = Review & {
  user: {
    name: string | null;
    image: string | null;
  };
};

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface CollegeFilters {
  search: string;
  city: string;
  minFees: number | undefined;
  maxFees: number | undefined;
  minRating: number | undefined;
  page: number;
}

// ─── Compare store ────────────────────────────────────────────────────────────

export interface CompareState {
  selectedIds: number[];
  addCollege: (id: number) => void;
  removeCollege: (id: number) => void;
  clearAll: () => void;
  canAdd: boolean;
}

// ─── NextAuth session extension ───────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
