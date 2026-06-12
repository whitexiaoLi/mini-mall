import { getOrderById, payOrder } from "@/app/actions/orders";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import PayButton from "./PayButton";
import Link from "next/link";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">请先登录</h2>
        <Link href="/auth/login" className="btn-primary mt-6">
          去登录
        </Link>
      </div>
    );
  }

  const order = await getOrderById(parseInt(id));
  if (!order) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/orders"
          className="text-muted hover:text-primary transition-colors"
        >
          ← 返回订单列表
        </Link>
      </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            订单 #{String(order.id).padStart(6, "0")}
          </h1>
          <p className="text-sm text-muted mt-1">
            {new Date(order.createdAt).toLocaleString("zh-CN")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {order.status === "PENDING" && <PayButton orderId={order.id} />}
        </div>
      </div>

      {/* Items */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">商品明细</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
            >
              <div>
                <span className="font-medium text-gray-900">
                  {item.productName}
                </span>
                <span className="text-muted ml-2">×{item.quantity}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">
                  ¥{(item.productPrice * item.quantity).toFixed(2)}
                </span>
                <div className="text-xs text-muted">
                  ¥{item.productPrice}/件
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-6">
        <h3 className="font-bold text-gray-900 mb-4">订单摘要</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>商品合计</span>
            <span>¥{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>运费</span>
            <span className="text-success">免运费</span>
          </div>
          <hr className="border-gray-100" />
          <div className="flex justify-between text-xl font-extrabold">
            <span>实付金额</span>
            <span className="text-accent">¥{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
