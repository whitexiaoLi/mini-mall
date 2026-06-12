"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setErrors({});
    const result = await register(formData);
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
            注册 Mini Mall
          </h1>
          <p className="mt-2 text-muted">创建你的账户，开始购物</p>
        </div>

        <div className="card p-8">
          <form action={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">用户名</label>
              <input
                type="text"
                name="name"
                className={`input-field ${errors.name ? "input-error" : ""}`}
                placeholder="你的昵称"
              />
              {errors.name && (
                <p className="form-error">{errors.name[0]}</p>
              )}
            </div>

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
                placeholder="至少 6 位密码"
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
              {submitting ? "注册中..." : "注册"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            已有账户？{" "}
            <Link
              href="/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
