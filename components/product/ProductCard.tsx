import Image from "next/image";
import Link from "next/link";
import type { Product, Category } from "@/app/generated/prisma/client";

interface ProductCardProps {
  product: Product & { category: Category };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="card block group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.imageUrl || "/placeholder.png"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 badge-sale">仅剩 {product.stock}</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">已售罄</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
          {product.category.name}
        </span>
        <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-accent">
            ¥{product.price}
          </span>
        </div>
      </div>
    </Link>
  );
}
