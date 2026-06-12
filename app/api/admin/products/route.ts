import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
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

// GET /api/admin/products?q=&page=1
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = 10;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [{ name: { contains: q } }, { description: { contains: q } }];
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

  return NextResponse.json({
    products,
    total,
    totalPages: Math.ceil(total / pageSize),
    page,
  });
}

// POST /api/admin/products — 创建商品
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, description, price, stock, imageUrl, categoryId } =
      result.data;

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug 已被占用" }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: { name, slug, description, price, stock, imageUrl, categoryId },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }
    console.error("POST /api/admin/products error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
