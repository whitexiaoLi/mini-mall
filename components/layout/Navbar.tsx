import Link from "next/link";
import { getSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Navbar() {
  const session = await getSession();

  async function handleLogout() {
    "use server";
    await clearSession();
    redirect("/");
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Mini Mall
          </Link>

          {/* Search (desktop) */}
          <form
            action="/products"
            method="GET"
            className="hidden md:flex flex-1 max-w-lg mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                name="q"
                placeholder="搜索商品..."
                className="input-field !py-2 !pr-10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/products"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
            >
              全部商品
            </Link>

            {session ? (
              <>
                <Link
                  href="/cart"
                  className="relative px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 inline-block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                    />
                  </svg>
                  <span className="ml-1">购物车</span>
                </Link>

                <Link
                  href="/orders"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  我的订单
                </Link>

                {session.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    后台管理
                  </Link>
                )}

                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  <span className="text-sm text-muted">{session.email}</span>
                  <form action={handleLogout}>
                    <button
                      type="submit"
                      className="btn-outline !py-1.5 !px-3 !text-xs"
                    >
                      退出
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-outline !py-1.5 !px-3 !text-xs">
                  登录
                </Link>
                <Link href="/auth/register" className="btn-primary !py-1.5 !px-3 !text-xs">
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
