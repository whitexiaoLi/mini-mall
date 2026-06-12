"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Category } from "@/app/generated/prisma/client";

interface SearchBarProps {
  categories: Category[];
}

export default function SearchBar({ categories }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQ = searchParams.get("q") || "";
  const currentCat = searchParams.get("category") || "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    const category = formData.get("category") as string;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          name="q"
          defaultValue={currentQ}
          placeholder="搜索商品名称或描述..."
          className="input-field !py-3 !pr-10"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
      <select
        name="category"
        defaultValue={currentCat}
        className="input-field !py-3 sm:max-w-[180px]"
      >
        <option value="">全部分类</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>
      <button type="submit" className="btn-primary !py-3">
        搜索
      </button>
    </form>
  );
}
