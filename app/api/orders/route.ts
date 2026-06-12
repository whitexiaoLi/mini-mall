import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/orders — 我的订单列表
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

// POST /api/orders — 从购物车创建订单
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "购物车为空" }, { status: 400 });
  }

  // 逐个检查库存，返回具体缺货商品
  const outOfStock: string[] = [];
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      outOfStock.push(`"${item.product.name}"（可用：${item.product.stock}）`);
    }
  }

  if (outOfStock.length > 0) {
    return NextResponse.json(
      { error: `以下商品库存不足：${outOfStock.join("、")}` },
      { status: 400 }
    );
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  try {
    // 数据库事务：创建订单 → 扣减库存 → 清空购物车
    const order = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: session.userId,
          totalAmount,
          items: {
            create: cartItems.map((item) => ({
              productName: item.product.name,
              productPrice: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: session.userId } });

      return order;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: "下单失败，请重试" }, { status: 500 });
  }
}
