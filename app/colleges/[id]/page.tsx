// app/colleges/[id]/page.tsx
// College detail page with hero, tabbed layout, charts, and reviews.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CollegeDetailClient } from "./CollegeDetailClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthRequired } from "@/components/auth/AuthRequired";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCollege(id: number) {
  return prisma.college.findUnique({
    where: { id },
    include: {
      courses: { orderBy: { fees: "asc" } },
      placements: { orderBy: { year: "desc" }, take: 3 },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, image: true } } },
      },
      _count: { select: { savedBy: true, reviews: true } },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { title: "Sign in required" };

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) return { title: "College Not Found" };

  const college = await prisma.college.findUnique({
    where: { id },
    select: { name: true, location: true, description: true },
  });

  if (!college) return { title: "College Not Found" };

  return {
    title: college.name,
    description: college.description.slice(0, 155),
  };
}

export default async function CollegeDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <AuthRequired title="Sign in to view college details" />;
  }

  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) notFound();

  const college = await getCollege(id);
  if (!college) notFound();

  return <CollegeDetailClient college={college} />;
}
