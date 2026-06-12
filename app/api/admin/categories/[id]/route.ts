import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/admin/categories/[id] — 分类详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    return NextResponse.json({ error: "分类不存在" }, { status: 404 });
  }

  return NextResponse.json(category);
}

// PUT /api/admin/categories/[id] — 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "名称和 Slug 为必填" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing && existing.id !== parseInt(id)) {
      return NextResponse.json({ error: "Slug 已被占用" }, { status: 409 });
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, slug, description: description || null },
    });

    return NextResponse.json(category);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
    }
    console.error("PUT /api/admin/categories error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] — 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  const count = await prisma.product.count({
    where: { categoryId: parseInt(id) },
  });
  if (count > 0) {
    return NextResponse.json(
      { error: "该分类下还有商品，无法删除" },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id: parseInt(id) } });

  return NextResponse.json({ success: true });
}
