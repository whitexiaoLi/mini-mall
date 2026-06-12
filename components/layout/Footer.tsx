import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <Link
              href="/"
              className="text-xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              Mini Mall
            </Link>
            <p className="text-sm mt-1">简约不简单的微型电商体验</p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/products" className="hover:text-white transition-colors">
              全部商品
            </Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">
              登录
            </Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">
              注册
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Mini Mall. Demo Project.
          </p>
        </div>
      </div>
    </footer>
  );
}
