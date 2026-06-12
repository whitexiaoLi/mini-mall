"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "商品名称为必填"),
  slug: z
    .string()
    .min(1, "Slug 为必填")
    .regex(/^[a-z0-9-]+$/, "Slug 只能包含小写字母、数字和连字符"),
  description: z.string().min(1, "商品描述为必填"),
  price: z.number().min(0, "价格不能为负数"),
  stock: z.number().int().min(0, "库存不能为负数"),
  imageUrl: z.string().optional(),
  categoryId: z.number().int().min(1, "请选择分类"),
  isActive: z.boolean().optional(),
});

export async function getAdminProducts(params: {
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();
  const { q, page = 1, pageSize = 10 } = params;

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, totalPages: Math.ceil(total / pageSize), page };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price") as string),
    stock: parseInt(formData.get("stock") as string),
    imageUrl: (formData.get("imageUrl") as string) || undefined,
    categoryId: parseInt(formData.get("categoryId") as string),
  };

  const result = productSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { name, slug, description, price, stock, imageUrl, categoryId } =
    result.data;

  try {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return { error: { slug: ["该 Slug 已被占用"] } };
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return { error: { categoryId: ["分类不存在"] } };
    }

    await prisma.product.create({
      data: { name, slug, description, price, stock, imageUrl, categoryId },
    });

    return { success: true };
  } catch {
    return { error: { _form: ["创建失败，请重试"] } };
  }
}

export async function updateProduct(id: number, formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: parseFloat(formData.get("price") as string),
    stock: parseInt(formData.get("stock") as string),
    imageUrl: (formData.get("imageUrl") as string) || undefined,
    categoryId: parseInt(formData.get("categoryId") as string),
    isActive: formData.get("isActive") === "true",
  };

  const result = productSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { name, slug, description, price, stock, imageUrl, categoryId, isActive } =
    result.data;

  try {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return { error: { slug: ["该 Slug 已被占用"] } };
    }

    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        stock,
        imageUrl,
        categoryId,
        isActive,
      },
    });

    return { success: true };
  } catch {
    return { error: { _form: ["更新失败，请重试"] } };
  }
}

export async function deleteProduct(id: number) {
  await requireAdmin();

  try {
    await prisma.product.delete({ where: { id } });
    return { success: true };
  } catch {
    return { error: { _form: ["删除失败，该商品可能有关联数据"] } };
  }
}

export async function getAdminProduct(id: number) {
  await requireAdmin();

  return prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
}
