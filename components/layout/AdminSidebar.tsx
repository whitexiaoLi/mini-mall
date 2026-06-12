"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "仪表盘", icon: "📊" },
  { href: "/admin/products", label: "商品管理", icon: "📦" },
  { href: "/admin/categories", label: "分类管理", icon: "🏷️" },
  { href: "/admin/orders", label: "订单管理", icon: "📋" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-gray-900 text-white min-h-[calc(100vh-4rem)] flex-shrink-0">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
