import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/constants";

// GET /api/products?q=&category=&page=1
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  const where: Record<string, unknown> = { isActive: true };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({
    products,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    page,
    pageSize: PAGE_SIZE,
    categories,
  });
}
