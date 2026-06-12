"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { payOrder } from "@/app/actions/orders";

interface PayButtonProps {
  orderId: number;
}

export default function PayButton({ orderId }: PayButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    await payOrder(orderId);
    router.refresh();
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? "支付中..." : "💰 模拟支付"}
    </button>
  );
}
