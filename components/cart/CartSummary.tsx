"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createOrder } from "@/app/actions/orders";

interface CartSummaryProps {
  total: number;
}

export default function CartSummary({ total }: CartSummaryProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");
    const result = await createOrder();

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/orders/${result.orderId}`);
    router.refresh();
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">订单摘要</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>商品合计</span>
          <span>¥{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>运费</span>
          <span className="text-success font-semibold">免运费</span>
        </div>
        <hr className="border-gray-100" />
        <div className="flex justify-between text-lg font-extrabold">
          <span>应付总额</span>
          <span className="text-accent">¥{total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-accent font-semibold">{error}</p>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading || total === 0}
        className="btn-accent w-full mt-6 !py-3 !text-lg"
      >
        {loading ? "下单中..." : "立即下单"}
      </button>
    </div>
  );
}
