import { getMyOrders } from "@/app/actions/orders";
import { getSession } from "@/lib/auth";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">请先登录</h2>
        <p className="mt-2 text-muted">登录后查看订单</p>
        <Link href="/auth/login" className="btn-primary mt-6">
          去登录
        </Link>
      </div>
    );
  }

  const orders = await getMyOrders();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">我的订单</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-gray-900">暂无订单</h2>
          <Link href="/products" className="btn-primary mt-6">
            去购物
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="card p-6 flex items-center justify-between hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted font-mono">
                    #{String(order.id).padStart(6, "0")}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="mt-2 text-sm text-muted">
                  {order.items.length} 件商品 ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-accent">
                  ¥{order.totalAmount.toFixed(2)}
                </div>
                <svg className="w-5 h-5 text-gray-400 ml-auto mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
