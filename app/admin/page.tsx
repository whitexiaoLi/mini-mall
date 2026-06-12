import { getDashboardStats } from "@/app/actions/admin/orders";
import StatsCard from "@/components/admin/StatsCard";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">仪表盘</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard
          title="商品总数"
          value={stats.productCount}
          icon="📦"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatsCard
          title="订单总数"
          value={stats.orderCount}
          icon="📋"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatsCard
          title="用户总数"
          value={stats.userCount}
          icon="👥"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatsCard
          title="总营收"
          value={`¥${stats.totalRevenue.toFixed(2)}`}
          icon="💰"
          color="bg-gradient-to-br from-accent to-pink-500"
        />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">最近订单</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  订单号
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  用户
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  金额
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  状态
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-muted">
                    #{String(order.id).padStart(6, "0")}
                  </td>
                  <td className="px-6 py-4 text-sm">{order.user.email}</td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    ¥{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">
                    暂无订单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
