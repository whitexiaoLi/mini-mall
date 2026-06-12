"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function createOrder() {
  const session = await getSession();
  if (!session) return { error: "请先登录" };

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return { error: "购物车为空" };
  }

  // 逐个检查库存，返回具体缺货商品
  const outOfStock: string[] = [];
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      outOfStock.push(`"${item.product.name}"（可用：${item.product.stock}）`);
    }
  }

  if (outOfStock.length > 0) {
    return { error: `以下商品库存不足：${outOfStock.join("、")}` };
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 数据库事务：创建订单 + 扣减库存 + 清空购物车
  const order = await prisma.$transaction(async (tx) => {
    // 1. 创建订单
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

    // 2. 逐项扣减库存
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 3. 清空购物车
    await tx.cartItem.deleteMany({ where: { userId: session.userId } });

    return order;
  });

  return { success: true, orderId: order.id };
}

export async function getMyOrders() {
  const session = await getSession();
  if (!session) return [];

  return prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: number) {
  const session = await getSession();
  if (!session) return null;

  return prisma.order.findFirst({
    where: { id: orderId, userId: session.userId },
    include: { items: true },
  });
}

export async function payOrder(orderId: number) {
  const session = await getSession();
  if (!session) return { error: "请先登录" };

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.userId },
  });

  if (!order) return { error: "订单不存在" };
  if (order.status !== "PENDING") return { error: "订单状态不允许支付" };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID" },
  });

  return { success: true };
}
