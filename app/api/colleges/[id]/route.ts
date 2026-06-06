// app/api/colleges/[id]/route.ts
// GET /api/colleges/[id] returns full college detail with relations.

import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { collegeIdSchema, reviewPaginationSchema } from "@/lib/validations";
import { apiError } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const { id: rawId } = await params;
    const idParsed = collegeIdSchema.safeParse({ id: rawId });
    if (!idParsed.success) {
      return apiError("Invalid college ID", 400, idParsed.error.flatten());
    }

    const { searchParams } = request.nextUrl;
    const reviewPagination = reviewPaginationSchema.safeParse({
      page: searchParams.get("reviewPage") ?? 1,
      limit: searchParams.get("reviewLimit") ?? 5,
    });

    const reviewPage = reviewPagination.success ? reviewPagination.data.page : 1;
    const reviewLimit = reviewPagination.success ? reviewPagination.data.limit : 5;
    const reviewSkip = (reviewPage - 1) * reviewLimit;

    const { id } = idParsed.data;

    const college = await prisma.college.findUnique({
      where: { id },
      include: {
        courses: { orderBy: { fees: "asc" } },
        placements: {
          orderBy: { year: "desc" },
          take: 3,
        },
        reviews: {
          skip: reviewSkip,
          take: reviewLimit,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        _count: {
          select: { savedBy: true, reviews: true },
        },
      },
    });

    if (!college) {
      return apiError("College not found", 404);
    }

    const totalReviewPages = Math.ceil(college._count.reviews / reviewLimit);
    const reviewMeta = {
      total: college._count.reviews,
      page: reviewPage,
      limit: reviewLimit,
      totalPages: totalReviewPages,
      hasNextPage: reviewPage < totalReviewPages,
      hasPreviousPage: reviewPage > 1,
    };

    return Response.json({
      ok: true,
      data: { college },
      college,
      reviewMeta,
      meta: { reviews: reviewMeta },
    });
  } catch (error) {
    console.error("[GET /api/colleges/[id]]", error);
    return apiError("Failed to fetch college", 500);
  }
}
