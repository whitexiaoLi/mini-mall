import { searchProducts } from "@/app/actions/products";
import ProductGrid from "@/components/product/ProductGrid";
import SearchBar from "@/components/product/SearchBar";
import Link from "next/link";
import { PAGE_SIZE } from "@/lib/constants";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const { products, total, totalPages, categories } = await searchProducts({
    q: params.q,
    category: params.category,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              发现你的
              <span className="block text-yellow-300">心仪好物</span>
            </h1>
            <p className="mt-4 text-lg text-white/80">
              搜索、浏览、下单 — 简约不简单的购物体验
            </p>
          </div>
        </div>
      </section>

      {/* Search & Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchBar categories={categories} />

        {/* Category Quick Links */}
        <div className="flex flex-wrap gap-2 mt-6">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !params.category
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            全部
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                params.category === cat.slug
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {params.q
              ? `搜索 "${params.q}" · ${total} 件`
              : params.category
              ? `${categories.find((c) => c.slug === params.category)?.name || ""} · ${total} 件`
              : `全部商品 · ${total} 件`}
          </h2>
        </div>

        <ProductGrid products={products} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const sp = new URLSearchParams();
              if (params.q) sp.set("q", params.q);
              if (params.category) sp.set("category", params.category);
              sp.set("page", p.toString());

              return (
                <Link
                  key={p}
                  href={`/?${sp.toString()}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    p === page
                      ? "bg-primary text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-bold text-sm mb-1">精选好物</h3>
            <p className="text-muted text-xs">电子、服装、家居等多个品类</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm mb-1">快速下单</h3>
            <p className="text-muted text-xs">一键加购，模拟支付，状态跟踪</p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-success/10 to-success/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm mb-1">安全可靠</h3>
            <p className="text-muted text-xs">密码加密，JWT 认证，数据有保障</p>
          </div>
        </div>
      </section>
    </div>
  );
}
