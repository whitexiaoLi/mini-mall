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

  // Verify stock
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      return {
        error: `商品 "${item.product.name}" 库存不足（可用：${item.product.stock}）`,
      };
    }
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Create order with items and deduct stock
  const order = await prisma.order.create({
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

  // Deduct stock and clear cart
  await Promise.all([
    ...cartItems.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    ),
    prisma.cartItem.deleteMany({ where: { userId: session.userId } }),
  ]);

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
