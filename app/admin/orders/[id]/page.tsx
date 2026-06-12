import { getAdminOrderById, updateOrderStatus } from "@/app/actions/admin/orders";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(parseInt(id));
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-muted hover:text-primary transition-colors text-sm"
      >
        ← 返回订单列表
      </Link>

      <div className="flex items-center justify-between mt-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            订单 #{String(order.id).padStart(6, "0")}
          </h1>
          <p className="text-sm text-muted mt-1">
            用户：{order.user.name} ({order.user.email}) ·{" "}
            {new Date(order.createdAt).toLocaleString("zh-CN")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Status Actions */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">状态操作：</span>
          <StatusActions orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      {/* Order Items */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">商品明细</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
            >
              <div>
                <span className="font-medium text-gray-900">{item.productName}</span>
                <span className="text-muted ml-2">×{item.quantity}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">
                  ¥{(item.productPrice * item.quantity).toFixed(2)}
                </span>
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

function StatusActions({
  orderId,
  currentStatus,
}: {
  orderId: number;
  currentStatus: string;
}) {
  return (
    <div className="flex gap-2">
      {currentStatus === "PENDING" && (
        <>
          <StatusForm orderId={orderId} status="PAID" label="💰 标记已支付" />
          <StatusForm orderId={orderId} status="CANCELLED" label="❌ 取消订单" />
        </>
      )}
      {currentStatus === "PAID" && (
        <>
          <StatusForm orderId={orderId} status="SHIPPED" label="📦 标记已发货" />
          <StatusForm orderId={orderId} status="CANCELLED" label="❌ 取消订单" />
        </>
      )}
      {currentStatus === "SHIPPED" && (
        <StatusForm orderId={orderId} status="DELIVERED" label="✅ 标记已送达" />
      )}
    </div>
  );
}

function StatusForm({
  orderId,
  status,
  label,
}: {
  orderId: number;
  status: string;
  label: string;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await updateOrderStatus(orderId, status);
      }}
    >
      <button type="submit" className="btn-outline">
        {label}
      </button>
    </form>
  );
}
