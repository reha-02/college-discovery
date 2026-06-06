// app/api/colleges/route.ts
// GET /api/colleges searches, filters, and paginates colleges.

import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { collegeListSchema } from "@/lib/validations";
import { apiError } from "@/lib/utils";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DATABASE_TIMEOUT_MS = 8000;

const FALLBACK_COLLEGES = [
  ["Indian Institute of Technology Bombay", "Mumbai, Maharashtra", "Mumbai", "Maharashtra", 220000, 4.9],
  ["Indian Institute of Technology Delhi", "Delhi, Delhi", "Delhi", "Delhi", 225000, 4.9],
  ["Indian Institute of Science", "Bangalore, Karnataka", "Bangalore", "Karnataka", 35000, 5.0],
  ["Indian Institute of Technology Hyderabad", "Hyderabad, Telangana", "Hyderabad", "Telangana", 218000, 4.8],
  ["Indian Institute of Technology Madras", "Chennai, Tamil Nadu", "Chennai", "Tamil Nadu", 215000, 4.9],
  ["College of Engineering Pune", "Pune, Maharashtra", "Pune", "Maharashtra", 78000, 4.5],
  ["Jadavpur University", "Kolkata, West Bengal", "Kolkata", "West Bengal", 42000, 4.5],
  ["Nirma University Institute of Technology", "Ahmedabad, Gujarat", "Ahmedabad", "Gujarat", 148000, 4.3],
  ["Malaviya National Institute of Technology", "Jaipur, Rajasthan", "Jaipur", "Rajasthan", 145000, 4.5],
  ["Punjab Engineering College", "Chandigarh, Punjab", "Chandigarh", "Punjab", 88000, 4.4],
  ["RV College of Engineering", "Bangalore, Karnataka", "Bangalore", "Karnataka", 120000, 4.5],
  ["BITS Pilani Hyderabad Campus", "Hyderabad, Telangana", "Hyderabad", "Telangana", 420000, 4.7],
].map(([name, location, city, state, fees, rating], index) => ({
  id: index + 1,
  name: String(name),
  location: String(location),
  city: String(city),
  state: String(state),
  fees: Number(fees),
  rating: Number(rating),
  imageUrl: [
    "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
    "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800",
  ][index % 3],
  _count: { courses: 4, reviews: 5 },
}));

function timeout<T>(ms: number): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Database timed out")), ms);
  });
}

function fallbackResponse(params: {
  search?: string;
  city?: string;
  state?: string;
  minFees?: number;
  maxFees?: number;
  minRating?: number;
  sort: "rating" | "fees-low" | "fees-high" | "name";
  page: number;
  limit: number;
}) {
  const { search, city, state, minFees, maxFees, minRating, sort, page, limit } = params;
  const normalizedSearch = search?.toLowerCase();
  const filtered = FALLBACK_COLLEGES.filter((college) => {
    const matchesSearch = normalizedSearch
      ? [college.name, college.location, college.city].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        )
      : true;

    return (
      matchesSearch &&
      (!city || college.city.toLowerCase() === city.toLowerCase()) &&
      (!state || college.state.toLowerCase() === state.toLowerCase()) &&
      (minFees === undefined || college.fees >= minFees) &&
      (maxFees === undefined || college.fees <= maxFees) &&
      (minRating === undefined || college.rating >= minRating)
    );
  }).sort((a, b) => {
    if (sort === "fees-low") return a.fees - b.fees;
    if (sort === "fees-high") return b.fees - a.fees;
    if (sort === "name") return a.name.localeCompare(b.name);
    return b.rating - a.rating;
  });

  const start = (page - 1) * limit;
  const colleges = filtered.slice(start, start + limit);
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

  return Response.json({
    ok: true,
    data: { colleges },
    colleges,
    total: filtered.length,
    page,
    totalPages,
    meta: {
      page,
      limit,
      total: filtered.length,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      sort,
      source: "fallback",
    },
    source: "fallback",
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const { searchParams } = request.nextUrl;

    const parsed = collegeListSchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      state: searchParams.get("state") ?? undefined,
      minFees: searchParams.get("minFees") ?? undefined,
      maxFees: searchParams.get("maxFees") ?? undefined,
      minRating: searchParams.get("minRating") ?? undefined,
      sort: searchParams.get("sort") ?? "rating",
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 12,
    });

    if (!parsed.success) {
      return apiError("Invalid college search parameters", 400, parsed.error.flatten());
    }

    const { search, city, state, minFees, maxFees, minRating, sort, page, limit } = parsed.data;
    const orderBy: Prisma.CollegeOrderByWithRelationInput =
      sort === "fees-low"
        ? { fees: "asc" }
        : sort === "fees-high"
        ? { fees: "desc" }
        : sort === "name"
        ? { name: "asc" }
        : { rating: "desc" };

    const where: Prisma.CollegeWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        city ? { city: { equals: city, mode: "insensitive" } } : {},
        state ? { state: { equals: state, mode: "insensitive" } } : {},
        minFees !== undefined ? { fees: { gte: minFees } } : {},
        maxFees !== undefined ? { fees: { lte: maxFees } } : {},
        minRating !== undefined ? { rating: { gte: minRating } } : {},
      ],
    };

    const skip = (page - 1) * limit;
    const data = await Promise.race([
      Promise.all([
        prisma.college.count({ where }),
        prisma.college.findMany({
          where,
          skip,
          take: limit,
          orderBy,
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
        }),
      ]),
      timeout<[number, typeof FALLBACK_COLLEGES]>(DATABASE_TIMEOUT_MS),
    ]);

    const [total, colleges] = data;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return Response.json({
      ok: true,
      data: { colleges },
      colleges,
      total,
      page,
      totalPages,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        sort,
        source: "database",
      },
      source: "database",
    });
  } catch {
    const parsed = collegeListSchema.safeParse({
      search: request.nextUrl.searchParams.get("search") ?? undefined,
      city: request.nextUrl.searchParams.get("city") ?? undefined,
      state: request.nextUrl.searchParams.get("state") ?? undefined,
      minFees: request.nextUrl.searchParams.get("minFees") ?? undefined,
      maxFees: request.nextUrl.searchParams.get("maxFees") ?? undefined,
      minRating: request.nextUrl.searchParams.get("minRating") ?? undefined,
      sort: request.nextUrl.searchParams.get("sort") ?? "rating",
      page: request.nextUrl.searchParams.get("page") ?? 1,
      limit: request.nextUrl.searchParams.get("limit") ?? 12,
    });

    if (!parsed.success) {
      return apiError("Invalid college search parameters", 400, parsed.error.flatten());
    }

    return fallbackResponse(parsed.data);
  }
}
