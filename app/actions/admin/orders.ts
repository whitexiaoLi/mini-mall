"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
  type OrderStatus,
} from "@/lib/constants";

export async function getAllOrders(params: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();
  const { status, page = 1, pageSize = 10 } = params;

  const where: Record<string, unknown> = {};
  if (status && ORDER_STATUSES.includes(status as OrderStatus)) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { email: true, name: true } }, items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, totalPages: Math.ceil(total / pageSize), page };
}

export async function updateOrderStatus(orderId: number, status: string) {
  await requireAdmin();

  // Validate status value
  if (!ORDER_STATUSES.includes(status as OrderStatus)) {
    return { error: { _form: ["无效的订单状态"] } };
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return { error: { _form: ["订单不存在"] } };
    }

    // Validate state transition
    const allowed = ORDER_TRANSITIONS[order.status as OrderStatus];
    if (!allowed.includes(status as OrderStatus)) {
      return {
        error: {
          _form: [
            `不允许从 "${order.status}" 转为 "${status}"`,
          ],
        },
      };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return { success: true };
  } catch {
    return { error: { _form: ["操作失败，请重试"] } };
  }
}

export async function getAdminOrderById(orderId: number) {
  await requireAdmin();

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { email: true, name: true } }, items: true },
  });
}

export async function getDashboardStats() {
  await requireAdmin();

  const [productCount, orderCount, userCount, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const totalRevenue = (
    await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } },
    })
  )._sum.totalAmount || 0;

  return { productCount, orderCount, userCount, totalRevenue, recentOrders };
}
