import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return NextResponse.json({ error: "无效的商品 ID" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }

  return NextResponse.json(product);
}
