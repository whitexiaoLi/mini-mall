import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/admin/categories — 分类列表
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(categories);
}

// POST /api/admin/categories — 创建分类
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "名称和 Slug 为必填" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug 已被占用" }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { name, slug, description: description || null },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "请求数据格式错误" }, { status: 400 });
    }
    console.error("POST /api/admin/categories error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
