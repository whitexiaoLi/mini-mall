"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/app/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setErrors({});
    const result = await login(formData);
    setSubmitting(false);

    if (result.error) {
      setErrors(result.error as Record<string, string[]>);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            欢迎回来
          </h1>
          <p className="mt-2 text-muted">登录你的 Mini Mall 账户</p>
        </div>

        <div className="card p-8">
          <form action={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">邮箱</label>
              <input
                type="email"
                name="email"
                className={`input-field ${errors.email ? "input-error" : ""}`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="form-error">{errors.email[0]}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="form-label">密码</label>
              <input
                type="password"
                name="password"
                className={`input-field ${errors.password ? "input-error" : ""}`}
                placeholder="请输入密码"
              />
              {errors.password && (
                <p className="form-error">{errors.password[0]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? "登录中..." : "登录"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            还没有账户？{" "}
            <Link
              href="/auth/register"
              className="text-primary font-semibold hover:underline"
            >
              立即注册
            </Link>
          </p>

          {/* Demo account hint */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-muted">
            <p className="font-semibold mb-1">Demo 测试账号：</p>
            <p>管理员：admin@minimall.com / admin123</p>
            <p>用户：user@minimall.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
