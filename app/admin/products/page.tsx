import { getAdminProducts, deleteProduct } from "@/app/actions/admin/products";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import Link from "next/link";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const { products, total, totalPages } = await getAdminProducts({
    q: params.q,
    page,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">商品管理</h1>
          <p className="mt-1 text-muted">共 {total} 件商品</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + 新增商品
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="flex gap-3 max-w-md">
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="搜索商品..."
            className="input-field"
          />
          <button type="submit" className="btn-outline">
            搜索
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">名称</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">分类</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">价格</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">库存</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">状态</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-muted">{product.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-muted">{product.category.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-accent">¥{product.price}</td>
                  <td className="px-6 py-4 text-sm">{product.stock}</td>
                  <td className="px-6 py-4">
                    {product.isActive ? (
                      <OrderStatusBadge status="PAID" />
                    ) : (
                      <OrderStatusBadge status="CANCELLED" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        编辑
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteProduct(product.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-sm text-accent hover:underline font-medium"
                          onClick={(e) => {
                            if (!confirm(`确定删除 "${product.name}"？`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          删除
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted">
                    暂无商品
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
            if (params.q) sp.set("q", params.q);
            sp.set("page", p.toString());
            return (
              <Link
                key={p}
                href={`/admin/products?${sp.toString()}`}
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
