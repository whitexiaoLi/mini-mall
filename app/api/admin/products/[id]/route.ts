import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1, "商品名称为必填"),
  slug: z
    .string()
    .min(1, "Slug 为必填")
    .regex(/^[a-z0-9-]+$/, "Slug 只能包含小写字母、数字和连字符"),
  description: z.string().min(1, "描述为必填"),
  price: z.number().min(0, "价格不能为负数"),
  stock: z.number().int().min(0, "库存不能为负数"),
  imageUrl: z.string().optional(),
  categoryId: z.number().int().min(1, "请选择分类"),
  isActive: z.boolean().optional(),
});

// PUT /api/admin/products/[id] — 更新商品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "无效的 ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, description, price, stock, imageUrl, categoryId, isActive } =
      result.data;

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing && existing.id !== productId) {
      return NextResponse.json({ error: "Slug 已被占用" }, { status: 409 });
    }

    const product = await prisma.product.update({
      where: { id: productId },
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
      include: { category: true },
    });

    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }
    console.error("PUT /api/admin/products error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — 删除商品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "无效的 ID" }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "删除失败，商品可能有关联数据" },
      { status: 400 }
    );
  }
}
