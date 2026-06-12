import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/cart — 获取当前用户购物车
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: {
      product: {
        include: { category: true },
      },
    },
    orderBy: { id: "asc" },
  });

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return NextResponse.json({ items, total });
}

// POST /api/cart — 加入购物车
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId || typeof productId !== "number") {
      return NextResponse.json({ error: "请提供有效的 productId" }, { status: 400 });
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json({ error: "数量至少为 1" }, { status: 400 });
    }

    // 验证商品存在且有库存
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `库存不足（可用：${product.stock}）` },
        { status: 400 }
      );
    }

    // 已有则增加数量，否则新建
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.userId,
          productId,
        },
      },
    });

    let cartItem;
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: { include: { category: true } } },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: session.userId,
          productId,
          quantity,
        },
        include: { product: { include: { category: true } } },
      });
    }

    return NextResponse.json(cartItem, { status: existing ? 200 : 201 });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }
    console.error("POST /api/cart error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
