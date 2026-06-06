// app/api/saved/route.ts
// GET, POST, DELETE /api/saved manages the user's saved colleges.

import { type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { savedCollegeSchema } from "@/lib/validations";
import { apiError } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
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

    return Response.json({
      ok: true,
      data: { saved },
      saved,
      meta: { count: saved.length },
    });
  } catch (error) {
    console.error("[GET /api/saved]", error);
    return apiError("Failed to fetch saved colleges", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const body: unknown = await request.json();
    const parsed = savedCollegeSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid saved college payload", 400, parsed.error.flatten());
    }

    const { collegeId } = parsed.data;

    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: { id: true },
    });
    if (!college) {
      return apiError("College not found", 404);
    }

    await prisma.savedCollege.upsert({
      where: { userId_collegeId: { userId: session.user.id, collegeId } },
      create: { userId: session.user.id, collegeId },
      update: {},
    });

    return Response.json(
      {
        ok: true,
        data: { saved: true, collegeId },
        saved: true,
        meta: { idempotent: true },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/saved]", error);
    return apiError("Failed to save college", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const body: unknown = await request.json();
    const parsed = savedCollegeSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid saved college payload", 400, parsed.error.flatten());
    }

    const { collegeId } = parsed.data;

    await prisma.savedCollege.deleteMany({
      where: { userId: session.user.id, collegeId },
    });

    return Response.json(
      {
        ok: true,
        data: { saved: false, collegeId },
        saved: false,
        meta: { idempotent: true },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/saved]", error);
    return apiError("Failed to unsave college", 500);
  }
}
