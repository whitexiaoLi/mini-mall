"use client";

import { useState, useEffect } from "react";
import type { Category } from "@/app/generated/prisma/client";

type CategoryWithCount = Category & { _count: { products: number } };

const API_BASE = "/api/admin/categories";

export default function CategoryManager({
  initialCategories,
}: {
  initialCategories: CategoryWithCount[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Refresh list after mutations
  async function refresh() {
    const res = await fetch(API_BASE);
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
  }

  async function handleCreate(formData: FormData) {
    setLoading(true);
    setError("");

    const body = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string || undefined,
    };

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setShowCreate(false);
    refresh();
  }

  async function handleUpdate(id: number, formData: FormData) {
    setLoading(true);
    setError("");

    const body = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string || undefined,
    };

    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setEditingId(null);
    refresh();
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`确定删除分类 "${name}"？`)) return;
    setLoading(true);
    setError("");

    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    refresh();
  }

  return (
    <div className="max-w-2xl">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-semibold">
          {error}
        </div>
      )}

      {/* Create Button */}
      {!showCreate && (
        <button onClick={() => setShowCreate(true)} className="btn-primary mb-6">
          + 新增分类
        </button>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="card p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">新增分类</h3>
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            loading={loading}
          />
        </div>
      )}

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="card p-4">
            {editingId === cat.id ? (
              <div>
                <h3 className="font-bold text-gray-900 mb-4">编辑分类</h3>
                <CategoryForm
                  initialData={{
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description || "",
                  }}
                  onSubmit={(formData) => handleUpdate(cat.id, formData)}
                  onCancel={() => setEditingId(null)}
                  loading={loading}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-semibold text-gray-900">{cat.name}</span>
                    <span className="text-muted ml-2">/{cat.slug}</span>
                    {cat.description && (
                      <p className="text-sm text-muted mt-0.5">{cat.description}</p>
                    )}
                  </div>
                  <span className="badge-new">{cat._count.products} 件商品</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(cat.id)}
                    className="text-sm text-primary hover:underline font-medium"
                    disabled={loading}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-sm text-accent hover:underline font-medium"
                    disabled={loading}
                  >
                    删除
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-muted py-8">暂无分类</p>
        )}
      </div>
    </div>
  );
}

interface CategoryFormProps {
  initialData?: { name: string; slug: string; description: string };
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function CategoryForm({ initialData, onSubmit, onCancel, loading }: CategoryFormProps) {
  return (
    <form
      action={onSubmit}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">名称 *</label>
          <input
            type="text"
            name="name"
            defaultValue={initialData?.name}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="form-label">Slug *</label>
          <input
            type="text"
            name="slug"
            defaultValue={initialData?.slug}
            className="input-field"
            required
            pattern="[a-z0-9-]+"
          />
        </div>
      </div>
      <div>
        <label className="form-label">描述（可选）</label>
        <input
          type="text"
          name="description"
          defaultValue={initialData?.description}
          className="input-field"
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "保存中..." : "保存"}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline">
          取消
        </button>
      </div>
    </form>
  );
}
