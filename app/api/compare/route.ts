// app/api/compare/route.ts
// GET /api/compare?ids=1,2,3 fetches colleges for side-by-side comparison.

import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { compareSchema } from "@/lib/validations";
import { apiError } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DATABASE_TIMEOUT_MS = 8000;

const FALLBACK_COMPARE = [
  {
    id: 1,
    name: "Indian Institute of Technology Bombay",
    location: "Mumbai, Maharashtra",
    city: "Mumbai",
    state: "Maharashtra",
    fees: 220000,
    rating: 4.9,
    description: "Premier engineering institution with strong placements and research.",
    imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
    createdAt: new Date(),
    courses: [
      { id: 1, name: "B.Tech Computer Science", duration: "4 Years", fees: 220000, collegeId: 1 },
      { id: 2, name: "M.Tech Artificial Intelligence", duration: "2 Years", fees: 250000, collegeId: 1 },
    ],
    placements: [{ id: 1, year: 2024, avgPackage: 2450000, highestPackage: 9000000, placementRate: 96.2, collegeId: 1 }],
    _count: { courses: 2 },
  },
  {
    id: 2,
    name: "Indian Institute of Science",
    location: "Bangalore, Karnataka",
    city: "Bangalore",
    state: "Karnataka",
    fees: 35000,
    rating: 5.0,
    description: "Research-led institution known for deep science and technology programs.",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
    createdAt: new Date(),
    courses: [
      { id: 3, name: "B.Sc Research", duration: "4 Years", fees: 35000, collegeId: 2 },
      { id: 4, name: "M.Tech Data Science", duration: "2 Years", fees: 90000, collegeId: 2 },
    ],
    placements: [{ id: 2, year: 2024, avgPackage: 2300000, highestPackage: 6500000, placementRate: 94.5, collegeId: 2 }],
    _count: { courses: 2 },
  },
  {
    id: 3,
    name: "BITS Pilani Hyderabad Campus",
    location: "Hyderabad, Telangana",
    city: "Hyderabad",
    state: "Telangana",
    fees: 420000,
    rating: 4.7,
    description: "Private technical campus with strong industry links.",
    imageUrl: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800",
    createdAt: new Date(),
    courses: [
      { id: 5, name: "B.E Computer Science", duration: "4 Years", fees: 420000, collegeId: 3 },
      { id: 6, name: "MBA Business Analytics", duration: "2 Years", fees: 520000, collegeId: 3 },
    ],
    placements: [{ id: 3, year: 2024, avgPackage: 1850000, highestPackage: 5800000, placementRate: 91.4, collegeId: 3 }],
    _count: { courses: 2 },
  },
];

function timeout<T>(ms: number): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Database timed out")), ms);
  });
}

function fallbackCompare(ids: number[]) {
  const colleges = ids
    .map((id, index) => FALLBACK_COMPARE.find((college) => college.id === id) ?? FALLBACK_COMPARE[index % FALLBACK_COMPARE.length])
    .map((college, index) => ({ ...college, id: ids[index] }));

  return Response.json({
    ok: true,
    data: { colleges },
    colleges,
    meta: { requestedIds: ids, count: colleges.length, source: "fallback" },
    source: "fallback",
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const idsParam = request.nextUrl.searchParams.get("ids");

    if (!idsParam) {
      return apiError("ids query parameter is required", 400);
    }

    const parsed = compareSchema.safeParse({ ids: idsParam });
    if (!parsed.success) {
      return apiError("Invalid compare parameters", 400, parsed.error.flatten());
    }

    const { ids } = parsed.data;

    const colleges = await Promise.race([
      prisma.college.findMany({
        where: { id: { in: ids } },
        include: {
          courses: true,
          placements: {
            orderBy: { year: "desc" },
            take: 1,
          },
          _count: { select: { courses: true } },
        },
      }),
      timeout<[]>(DATABASE_TIMEOUT_MS),
    ]);

    if (colleges.length !== ids.length) {
      return fallbackCompare(ids);
    }

    const ordered = ids.map((id) => colleges.find((college) => college.id === id)!);

    return Response.json({
      ok: true,
      data: { colleges: ordered },
      colleges: ordered,
      meta: { requestedIds: ids, count: ordered.length, source: "database" },
      source: "database",
    });
  } catch {
    const idsParam = request.nextUrl.searchParams.get("ids");
    const parsed = compareSchema.safeParse({ ids: idsParam ?? "" });
    if (!parsed.success) {
      return apiError("Invalid compare parameters", 400, parsed.error.flatten());
    }
    return fallbackCompare(parsed.data.ids);
  }
}
