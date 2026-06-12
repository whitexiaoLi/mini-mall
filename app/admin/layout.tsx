import { requireAdmin, getSession } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const session = await getSession();

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              ← 返回前台
            </Link>
            <span className="text-sm text-gray-400">|</span>
            <span className="text-sm text-gray-600">
              管理员：{session?.email}
            </span>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
