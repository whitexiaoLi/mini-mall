"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addToCart } from "@/app/actions/cart";

interface AddToCartButtonProps {
  productId: number;
  productName: string;
  disabled: boolean;
}

export default function AddToCartButton({
  productId,
  productName,
  disabled,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAdd() {
    setLoading(true);
    const result = await addToCart(productId, 1);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled || loading}
      className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all ${
        success
          ? "bg-success text-white"
          : disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "btn-accent !py-3 !text-lg"
      }`}
    >
      {success ? "✓ 已加入购物车" : loading ? "添加中..." : `加入购物车 - ¥${productName}`}
    </button>
  );
}
