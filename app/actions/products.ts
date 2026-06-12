"use server";

import { prisma } from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/constants";

export interface ProductSearchParams {
  q?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export async function searchProducts(params: ProductSearchParams) {
  const { q, category, page = 1, pageSize = PAGE_SIZE } = params;

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
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return {
    products,
    total,
    totalPages: Math.ceil(total / pageSize),
    page,
    categories,
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.isActive) return null;

  return product;
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
