"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "分类名称为必填"),
  slug: z
    .string()
    .min(1, "Slug 为必填")
    .regex(/^[a-z0-9-]+$/, "Slug 只能包含小写字母、数字和连字符"),
  description: z.string().optional(),
});

export async function getCategories() {
  await requireAdmin();
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { id: "asc" },
  });
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: (formData.get("description") as string) || undefined,
  };

  const result = categorySchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { name, slug, description } = result.data;

  try {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return { error: { slug: ["Slug 已被占用"] } };
    }

    await prisma.category.create({
      data: { name, slug, description: description || null },
    });

    return { success: true };
  } catch {
    return { error: { _form: ["创建失败，请重试"] } };
  }
}

export async function updateCategory(id: number, formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: (formData.get("description") as string) || undefined,
  };

  const result = categorySchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { name, slug, description } = result.data;

  try {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return { error: { slug: ["Slug 已被占用"] } };
    }

    await prisma.category.update({
      where: { id },
      data: { name, slug, description: description || null },
    });

    return { success: true };
  } catch {
    return { error: { _form: ["更新失败，请重试"] } };
  }
}

export async function deleteCategory(id: number) {
  await requireAdmin();

  try {
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return { error: { _form: ["该分类下还有商品，无法删除"] } };
    }

    await prisma.category.delete({ where: { id } });
    return { success: true };
  } catch {
    return { error: { _form: ["删除失败，请重试"] } };
  }
}
