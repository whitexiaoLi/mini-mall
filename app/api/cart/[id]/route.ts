import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT /api/cart/[id] — 修改数量
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id);

  if (isNaN(itemId)) {
    return NextResponse.json({ error: "无效的购物车项 ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { quantity } = body;

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json({ error: "数量不能小于 0" }, { status: 400 });
    }

    // 验证该购物车项属于当前用户
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, userId: session.userId },
      include: { product: true },
    });

    if (!item) {
      return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
    }

    // 数量为 0 则删除
    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ success: true, deleted: true });
    }

    // 检查库存
    if (item.product.stock < quantity) {
      return NextResponse.json(
        { error: `库存不足（可用：${item.product.stock}）` },
        { status: 400 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: { include: { category: true } } },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }
    console.error("PUT /api/cart error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

// DELETE /api/cart/[id] — 删除购物车项
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id);

  if (isNaN(itemId)) {
    return NextResponse.json({ error: "无效的购物车项 ID" }, { status: 400 });
  }

  // 验证该购物车项属于当前用户
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, userId: session.userId },
  });

  if (!item) {
    return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return NextResponse.json({ success: true });
}
