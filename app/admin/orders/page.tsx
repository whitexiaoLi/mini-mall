import { getAllOrders, updateOrderStatus } from "@/app/actions/admin/orders";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import Link from "next/link";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const { orders, total, totalPages } = await getAllOrders({
    status: params.status,
    page,
  });

  const statusFilters = [
    { value: "", label: "全部" },
    { value: "PENDING", label: "待支付" },
    { value: "PAID", label: "已支付" },
    { value: "SHIPPED", label: "已发货" },
    { value: "DELIVERED", label: "已送达" },
    { value: "CANCELLED", label: "已取消" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">订单管理</h1>
          <p className="mt-1 text-muted">共 {total} 个订单</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((f) => {
          const isActive =
            (f.value === "" && !params.status) || f.value === params.status;
          const sp = new URLSearchParams();
          if (f.value) sp.set("status", f.value);

          return (
            <Link
              key={f.value}
              href={`/admin/orders${sp.toString() ? `?${sp.toString()}` : ""}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">订单号</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">用户</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">商品数</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">金额</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">状态</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">时间</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-muted">
                    #{String(order.id).padStart(6, "0")}
                  </td>
                  <td className="px-6 py-4 text-sm">{order.user.email}</td>
                  <td className="px-6 py-4 text-sm">{order.items.length}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-accent">
                    ¥{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        详情
                      </Link>
                      {order.status === "PENDING" && (
                        <StatusButton
                          orderId={order.id}
                          status="PAID"
                          label="标记支付"
                          action={updateOrderStatus}
                        />
                      )}
                      {order.status === "PAID" && (
                        <StatusButton
                          orderId={order.id}
                          status="SHIPPED"
                          label="标记发货"
                          action={updateOrderStatus}
                        />
                      )}
                      {order.status === "SHIPPED" && (
                        <StatusButton
                          orderId={order.id}
                          status="DELIVERED"
                          label="标记送达"
                          action={updateOrderStatus}
                        />
                      )}
                      {(order.status === "PENDING" || order.status === "PAID") && (
                        <StatusButton
                          orderId={order.id}
                          status="CANCELLED"
                          label="取消"
                          action={updateOrderStatus}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted">
                    暂无订单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const sp = new URLSearchParams();
            if (params.status) sp.set("status", params.status);
            sp.set("page", p.toString());
            return (
              <Link
                key={p}
                href={`/admin/orders?${sp.toString()}`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold ${
                  p === page
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusButton({
  orderId,
  status,
  label,
  action,
}: {
  orderId: number;
  status: string;
  label: string;
  action: (orderId: number, status: string) => Promise<{ success?: boolean; error?: Record<string, string[]> }>;
}) {
  return (
    <form
      action={async () => {
        "use server";
        await action(orderId, status);
      }}
    >
      <button type="submit" className="text-sm text-muted hover:text-primary font-medium">
        {label}
      </button>
    </form>
  );
}
