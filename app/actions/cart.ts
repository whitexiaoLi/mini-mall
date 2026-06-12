"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function addToCart(productId: number, quantity: number) {
  const session = await getSession();
  if (!session) {
    return { error: "请先登录" };
  }

  // Check product exists and in stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || !product.isActive) {
    return { error: "商品不存在" };
  }

  if (product.stock < quantity) {
    return { error: "库存不足" };
  }

  // Upsert cart item
  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId: session.userId,
        productId,
      },
    },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        userId: session.userId,
        productId,
        quantity,
      },
    });
  }

  return { success: true };
}

export async function getCart() {
  const session = await getSession();
  if (!session) return { items: [], total: 0 };

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

  return { items, total };
}

export async function updateCartItemQuantity(itemId: number, quantity: number) {
  const session = await getSession();
  if (!session) return { error: "请先登录" };

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: itemId, userId: session.userId },
    });
    return { success: true };
  }

  await prisma.cartItem.update({
    where: { id: itemId, userId: session.userId },
    data: { quantity },
  });

  return { success: true };
}

export async function removeCartItem(itemId: number) {
  const session = await getSession();
  if (!session) return { error: "请先登录" };

  await prisma.cartItem.delete({
    where: { id: itemId, userId: session.userId },
  });

  return { success: true };
}

export async function clearCart() {
  const session = await getSession();
  if (!session) return { error: "请先登录" };

  await prisma.cartItem.deleteMany({
    where: { userId: session.userId },
  });

  return { success: true };
}
