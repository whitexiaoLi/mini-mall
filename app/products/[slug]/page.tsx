import { getProductBySlug } from "@/app/actions/products";
import { getSession } from "@/lib/auth";
import { addToCart } from "@/app/actions/cart";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const session = await getSession();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-8">
        <Link href="/" className="hover:text-primary">
          首页
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">
          全部商品
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-primary"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-primary uppercase tracking-wide">
            {product.category.name}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            {product.name}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-accent">
              ¥{product.price}
            </span>
          </div>

          {/* Stock */}
          <div className="mt-4">
            {product.stock > 10 ? (
              <span className="text-sm text-success font-semibold">
                库存充足 ({product.stock} 件)
              </span>
            ) : product.stock > 0 ? (
              <span className="text-sm text-warning font-semibold">
                库存紧张，仅剩 {product.stock} 件
              </span>
            ) : (
              <span className="text-sm text-accent font-semibold">已售罄</span>
            )}
          </div>

          {/* Description */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2">商品描述</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Add to Cart */}
          <div className="mt-8">
            {session ? (
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                disabled={product.stock === 0}
              />
            ) : (
              <div className="space-y-3">
                <div className="btn-primary w-full !opacity-50 !cursor-not-allowed">
                  加入购物车
                </div>
                <p className="text-center text-sm text-muted">
                  请先
                  <Link
                    href="/auth/login"
                    className="text-primary font-semibold hover:underline mx-1"
                  >
                    登录
                  </Link>
                  后购买
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
