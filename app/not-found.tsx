import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          404
        </h1>
        <p className="mt-4 text-lg text-gray-600">页面未找到</p>
        <Link href="/" className="btn-primary mt-8">
          返回首页
        </Link>
      </div>
    </div>
  );
}
