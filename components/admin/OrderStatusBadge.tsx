interface OrderStatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "待支付", className: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "已支付", className: "bg-blue-100 text-blue-800" },
  SHIPPED: { label: "已发货", className: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "已送达", className: "bg-green-100 text-green-800" },
  COMPLETED: { label: "已完成", className: "bg-green-100 text-green-800" },
  CANCELLED: { label: "已取消", className: "bg-gray-100 text-gray-600" },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
