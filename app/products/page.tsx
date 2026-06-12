import { searchProducts } from "@/app/actions/products";
import SearchBar from "@/components/product/SearchBar";
import ProductGrid from "@/components/product/ProductGrid";
import Link from "next/link";

export default async function ProductsPage({
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
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">全部商品</h1>
        <p className="mt-1 text-muted">
          {params.q
            ? `搜索 "${params.q}" 的结果`
            : `共 ${total} 件商品`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar categories={categories} />
      </div>

      {/* Category Quick Links */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
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

      {/* Products */}
      <ProductGrid products={products} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const searchParams = new URLSearchParams();
            if (params.q) searchParams.set("q", params.q);
            if (params.category) searchParams.set("category", params.category);
            searchParams.set("page", p.toString());

            return (
              <Link
                key={p}
                href={`/products?${searchParams.toString()}`}
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
    </div>
  );
}
