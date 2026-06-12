"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateCartItemQuantity, removeCartItem } from "@/app/actions/cart";
import type { CartItem, Product, Category } from "@/app/generated/prisma/client";

interface CartItemRowProps {
  item: CartItem & { product: Product & { category: Category } };
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();

  async function handleUpdate(quantity: number) {
    await updateCartItemQuantity(item.id, quantity);
    router.refresh();
  }

  async function handleRemove() {
    await removeCartItem(item.id);
    router.refresh();
  }

  const subtotal = item.product.price * item.quantity;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={item.product.imageUrl || "/placeholder.png"}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {item.product.name}
        </h3>
        <p className="text-sm text-muted">{item.product.category.name}</p>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleUpdate(item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
        >
          −
        </button>
        <span className="w-10 text-center font-semibold">{item.quantity}</span>
        <button
          onClick={() => handleUpdate(item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
        >
          +
        </button>
      </div>

      {/* Price */}
      <div className="text-right w-24">
        <div className="font-semibold text-accent">¥{subtotal.toFixed(2)}</div>
        <div className="text-xs text-muted">¥{item.product.price}/件</div>
      </div>

      {/* Remove */}
      <button
        onClick={handleRemove}
        className="p-2 text-gray-400 hover:text-accent transition-colors"
        title="删除"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
