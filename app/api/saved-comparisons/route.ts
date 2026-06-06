// app/api/saved-comparisons/route.ts
// GET, POST, DELETE /api/saved-comparisons manages saved compare sets.

import { type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { savedComparisonDeleteSchema, savedComparisonSchema } from "@/lib/validations";
import { apiError } from "@/lib/utils";

function normalizeCollegeIds(ids: number[]) {
  return [...ids].sort((a, b) => a - b);
}

function makeTitle(names: string[]) {
  return names.join(" vs ");
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const comparisons = await prisma.savedComparison.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const collegeIds = [...new Set(comparisons.flatMap((comparison) => comparison.collegeIds))];
    const colleges = await prisma.college.findMany({
      where: { id: { in: collegeIds } },
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

    const collegeById = new Map(colleges.map((college) => [college.id, college]));
    const enriched = comparisons.map((comparison) => ({
      ...comparison,
      colleges: comparison.collegeIds
        .map((id) => collegeById.get(id))
        .filter(Boolean),
    }));

    return Response.json({
      ok: true,
      data: { comparisons: enriched },
      comparisons: enriched,
      meta: { count: enriched.length },
    });
  } catch (error) {
    console.error("[GET /api/saved-comparisons]", error);
    return apiError("Failed to fetch saved comparisons", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const body: unknown = await request.json();
    const parsed = savedComparisonSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid saved comparison payload", 400, parsed.error.flatten());
    }

    const collegeIds = normalizeCollegeIds(parsed.data.collegeIds);
    const colleges = await prisma.college.findMany({
      where: { id: { in: collegeIds } },
      select: { id: true, name: true },
    });

    if (colleges.length !== collegeIds.length) {
      return apiError("One or more colleges were not found", 404);
    }

    const collegeKey = collegeIds.join("-");
    const collegeNameById = new Map(colleges.map((college) => [college.id, college.name]));
    const title = parsed.data.title ?? makeTitle(collegeIds.map((id) => collegeNameById.get(id) ?? `College ${id}`));

    const comparison = await prisma.savedComparison.upsert({
      where: { userId_collegeKey: { userId: session.user.id, collegeKey } },
      create: {
        userId: session.user.id,
        collegeIds,
        collegeKey,
        title,
      },
      update: {
        title,
      },
    });

    return Response.json({
      ok: true,
      data: { comparison },
      comparison,
      meta: { idempotent: true },
    });
  } catch (error) {
    console.error("[POST /api/saved-comparisons]", error);
    return apiError("Failed to save comparison", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const body: unknown = await request.json();
    const parsed = savedComparisonDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid saved comparison payload", 400, parsed.error.flatten());
    }

    await prisma.savedComparison.deleteMany({
      where: {
        id: parsed.data.id,
        userId: session.user.id,
      },
    });

    return Response.json({
      ok: true,
      data: { deleted: true, id: parsed.data.id },
      deleted: true,
      meta: { idempotent: true },
    });
  } catch (error) {
    console.error("[DELETE /api/saved-comparisons]", error);
    return apiError("Failed to remove saved comparison", 500);
  }
}
