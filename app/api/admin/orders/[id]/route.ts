import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
  type OrderStatus,
} from "@/lib/constants";

// PUT /api/admin/orders/[id] — 更新订单状态
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    return NextResponse.json({ error: "无效的订单 ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json({ error: "无效的订单状态" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    const allowed = ORDER_TRANSITIONS[order.status as OrderStatus];
    if (!allowed.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: `不允许从 "${order.status}" 转为 "${status}"` },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
    }
    console.error("PUT /api/admin/orders error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
